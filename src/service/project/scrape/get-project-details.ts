import x from "../xray";

export default async (html: string) => {
  return x(html, ".grid-x", {
    target: `#single-project-content > div.single-project--content-header.grid-x.align-middle > div:nth-child(1) > div > div | trim | split:":" | index:1 | trim`,
    opens: `#single-project-content > div.single-project--content-header.grid-x.align-middle > div:nth-child(2) > div > div | trim | split:":" | index:1 | trim`,
    expires: `div:nth-child(3) > div > div | trim | split:":" | index:1 | trim`,
    interest: `.single-project--details > div:nth-child(1) > strong`,
    type: `#single-project-content > div.single-project--content-header.grid-x.align-middle > div:nth-child(4) > div > div | trim | split:":" | index:1 | trim`,
    location: `div:nth-child(5) > div > div | trim | split:":" | index:1 | trim`,
    investors: `div:nth-child(6) > div > div | trim | split:":" | index:1 | trim`,
  });
};
