import * as countries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(en)

export interface CountryOption {
  code: string
  name: string
}

export const COUNTRY_OPTIONS: CountryOption[] = Object.entries(
  countries.getNames('en'),
)
  .map(([code, name]) => ({
    code,
    name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function isValidCountryCode(
  value: unknown,
): value is string {
  return (
    typeof value === 'string' &&
    /^[A-Z]{2}$/.test(value) &&
    countries.isValid(value)
  )
}
