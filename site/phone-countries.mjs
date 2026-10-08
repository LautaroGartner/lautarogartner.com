import {getCountries, getCountryCallingCode, parsePhoneNumberFromString} from 'libphonenumber-js';
export const phoneCountries = getCountries();
export const isPhoneCountry = country => typeof country === 'string' && phoneCountries.includes(country);
export function countryOptions(language) {
 const names = new Intl.DisplayNames([language], {type:'region'});
 return phoneCountries.map(value => ({value, code:getCountryCallingCode(value), name:names.of(value)})).sort((a,b)=>a.name.localeCompare(b.name,language));
}
export function displayPhone(phone, country) {
 const value=phone.trim();
 if(!value)return '';
 const parsed=parsePhoneNumberFromString(value,{defaultCountry:isPhoneCountry(country)?country:undefined,extract:false});
 return parsed?.isPossible()?parsed.formatInternational():value;
}
