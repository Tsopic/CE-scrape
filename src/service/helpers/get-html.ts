/* eslint-disable security/detect-object-injection */
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import delay from "../../utils/delay";
//import getProxy from "./get-proxy";
import configuration from "../../common/configuration";

type Options = {
  maxRetries?: number;
  proxy?: boolean;
  maxRedirects?: number;
  timeout?: number;
  headers?: Record<string, string>;
};

const Cookies: Record<string, { date: Date; cookies: string[] }> = {};

const getHtml = async (
  url: string,
  options: Options = {},
  retryCount: number = 0
): Promise<string | null> => {
  const key = new URL(url).hostname;
  const maxRetries = Number.isFinite(options.maxRetries)
    ? options.maxRetries
    : 5;
  const proxy = false; //options.proxy ? getProxy() : false;
  const config: AxiosRequestConfig = {
    url,
    timeout: options.timeout || configuration.html_fetch_timeout,
    responseType: "text",
    maxRedirects: options.maxRedirects || 0,
    proxy,
    headers: { Cookie: Cookies[key], ...options.headers },
  };

  if (!config.headers.Cookie) delete config.headers.Cookie;

  let statusCode: number;

  try {
    const { data: html, headers, status } = await axios(config);
    statusCode = status;
    if (status >= 400)
      throw new Error(`Request failed with status code ${status}`);
    Cookies[key] = (headers["set-cookie"] || [])
      .map((item: string) => item.split(";")[0])
      .join("; ");
    return html;
  } catch (e) {
    delete e.response;
    delete e.request;

    if (retryCount < maxRetries && (!statusCode || statusCode !== 404)) {
      await delay(1000 * 3);
      return getHtml(url, options, retryCount + 1);
    }
    const error: AxiosError = e;
    if (error.response && error.response.status === 302) return null;
    throw e;
  }
};

export default (url: string, options?: Options) => getHtml(url, options);
