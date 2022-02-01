import quantile from "./quantile.js";

export default function median(values, valueof) {
  return quantile(values, 0.5, valueof);
}
