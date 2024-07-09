import * as randomstring from 'randomstring';

export default class SecurityUtil {
  public static decodeFromBase64 = (base64String: string): string => {
    return Buffer.from(base64String, 'base64').toString('ascii');
  };

  public static toBase64 = (string: string): string => {
    return Buffer.from(string).toString('base64');
  };

  public static randomInt = (length: number): number => {
    return randomstring.generate({
      length,
      charset: 'numeric',
    });
  };

  public static isBase64(value: string): boolean {
    const base64Regex =
      /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
    return base64Regex.test(value);
  }
}
