import axios, { AxiosInstance } from 'axios';

export default class RequestUtil {
  static makeGetRequest = (
    url: string,
    config?: any,
    headers?: any,
    timeout?: number,
  ) => {
    return RequestUtil.getAxiosInstance(headers, timeout).get(url, config);
  };

  /**
   * Single axios instance for all our calls.
   * @param headers
   * @param timeout
   * @returns
   */
  private static getAxiosInstance = (
    headers?: any,
    timeout = 40000,
  ): AxiosInstance => {
    return axios.create({
      timeout,
      headers,
    });
  };
}
