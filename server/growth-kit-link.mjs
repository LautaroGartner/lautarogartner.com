import { signature } from './form-security.mjs';

export function kitPath(id, secret) {
  return '/api/growth-kit?id=' + id + '&key=' + signature('growth-kit/' + id, secret);
}
