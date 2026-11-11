
import type { WebRTCAnalysis } from './webrtc.types'

const STUN_SERVER = 'stun:stun.l.google.com:19302'
const GATHERING_TIMEOUT = 8_000

function isIPv4(value: string): boolean {
  const parts = value.split('.')

  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^\d{1,3}$/.test(part) &&
        Number(part) >= 0 &&
        Number(part) <= 255,
    )
  )
}

function isIPv6(value: string): boolean {
  return (
    value.includes(':') &&
    /^[\da-f:]+$/i.test(value) &&
    value.split('::').length <= 2
  )
}

function isValidIp(value: string): boolean {
  return isIPv4(value) || isIPv6(value)
}

function getIpFamily(ip: string): 4 | 6 | null {
  if (isIPv4(ip)) return 4
  if (isIPv6(ip)) return 6

  return null
}

function isPrivateIp(ip: string): boolean {
  if (isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)

    if (a === undefined || b === undefined) return false

    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a === 0
    )
  }

  const normalized = ip.toLowerCase()

  return (
    normalized === '::' ||
    normalized === '::1' ||
    /^f[cd]/i.test(normalized) ||
    /^fe[89ab]/i.test(normalized)
  )
}

export async function analyzeWebRTC(
  expectedPublicIp: string,
): Promise<WebRTCAnalysis> {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: STUN_SERVER }],
  })

  const publicIps = new Set<string>()
  const privateIps = new Set<string>()

  try {
    peerConnection.createDataChannel('privacy-guard')

    const gatheringComplete = new Promise<void>((resolve) => {
      if (peerConnection.iceGatheringState === 'complete') {
        resolve()
        return
      }

      peerConnection.addEventListener(
        'icegatheringstatechange',
        () => {
          if (peerConnection.iceGatheringState === 'complete') {
            resolve()
          }
        },
      )
    })

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    await Promise.race([
      gatheringComplete,
      new Promise<void>((resolve) => {
        setTimeout(resolve, GATHERING_TIMEOUT)
      }),
    ])

    const candidates =
      peerConnection.localDescription?.sdp?.match(
        /^a=candidate:.+$/gm,
      ) ?? []

    for (const candidate of candidates) {
      const match = candidate.match(
        /^a=candidate:\S+\s+\d+\s+\S+\s+\d+\s+(\S+)/,
      )

      const ip = match?.[1]

      if (!ip || !isValidIp(ip)) continue

      if (isPrivateIp(ip)) {
        privateIps.add(ip)
      } else {
        publicIps.add(ip)
      }
    }

    const expectedFamily = getIpFamily(expectedPublicIp)

    const comparablePublicIps = [...publicIps].filter(
      (ip) => getIpFamily(ip) === expectedFamily,
    )

    const hasPublicIpMismatch =
      comparablePublicIps.length > 0 &&
      comparablePublicIps.some((ip) => ip !== expectedPublicIp)

    return {
      status:
        comparablePublicIps.length === 0
          ? 'unavailable'
          : hasPublicIpMismatch
            ? 'ip-mismatch'
            : 'no-leak-detected',
      publicIps: [...publicIps],
      privateIps: [...privateIps],
      hasPublicIpMismatch,
      checkedAt: Date.now(),
    }
  } catch {
    return {
      status: 'unavailable',
      publicIps: [...publicIps],
      privateIps: [...privateIps],
      hasPublicIpMismatch: false,
      checkedAt: Date.now(),
    }
  } finally {
    peerConnection.close()
  }
}
