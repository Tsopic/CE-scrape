import { URL } from "url";

type ValueType = string | number;

const parseMoneyValue = (value: ValueType) => {
  if (typeof value === "string") {
    const result = /([\d.]+)(m|Th)/.exec(value);
    if (result)
      return Math.round(
        parseFloat(result[1]) * (result[2] === "m" ? 1e6 : 1e3)
      );
  }
  return null;
};

export default {
  trim(value: ValueType) {
    return typeof value === "string" ? value.trim() : value;
  },
  float(value: ValueType) {
    if (typeof value === "string") {
      return parseFloat(value);
    }
    return null;
  },
  replace(value: ValueType, find: string, v: string = "") {
    return typeof value === "string"
      ? // eslint-disable-next-line security/detect-non-literal-regexp
        value.replace(new RegExp(find, "g"), v)
      : value;
  },
  split(value: ValueType, find: string) {
    return typeof value === "string"
      ? // eslint-disable-next-line security/detect-non-literal-regexp
        value.split(new RegExp(find, "g"))
      : value;
  },
  index<T>(value: T[], index: number) {
    // eslint-disable-next-line security/detect-object-injection
    return Array.isArray(value) ? value[index] : null;
  },
  label(value: ValueType, label: string) {
    if (typeof value === "string" && value.startsWith(label)) {
      return value.substr(label.length).trim();
    }
    return null;
  },
  date(value: ValueType) {
    if (typeof value === "string") {
      return new Date(`${value.trim()}Z`);
    }
    return null;
  },
  integer(value: ValueType) {
    if (typeof value === "string") {
      return parseInt(value, 10);
    }
    return null;
  },
  digits(value: ValueType) {
    if (typeof value === "string") {
      return value.replace(/\D/g, "");
    }
    return null;
  },
  linkLastParam(value: ValueType) {
    if (typeof value === "string") return value.split(/\//g).slice(-1).pop();
    return null;
  },
  agencyMarketValue: parseMoneyValue,
  urlQueryValue(value: ValueType, name: string, base?: string) {
    if (typeof value === "string") {
      return new URL(value, base).searchParams.get(name);
    }

    return null;
  },
};
