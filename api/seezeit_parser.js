const cors = require('cors');
const express = require('express');
const app = express();
const parseString = require('xml2js').parseString;
const http = require('http');
const seezeitDE = 'https://www.seezeit.com/essen/speiseplaene/';
const seezeitEN = 'https://www.seezeit.com/en/food/menus/';
const seezeitXmlDE = 'http://www.max-manager.de/daten-extern/seezeit/xml/%i/speiseplan.xml';
const seezeitXmlEN = 'http://www.max-manager.de/daten-extern/seezeit/xml/%i/speiseplan_en.xml';
const defaultMensaDE = 'mensa-giessberg';
const defaultMensaEN = 'giessberg-canteen'

function convertXmltoJson(xml) {
    let menus = [];
    if (!xml || !xml.speiseplan || xml.speiseplan.length <= 1) {
        menus.push({
            date: new Date(),
            dishes: [{
                Name: "no data available",
                Category: "",
                Pricing: "",
                PricingSchool: "",
                PricingEmp: "",
                PricingGuest: "",
                Tags: []
            }]
        })
        return menus;
    }
    xml.speiseplan.tag.forEach((day) => {
        let menu = {
            date: new Date(day.$.timestamp * 1000),
            dishes: []
        };
        day.item.forEach((item) => {
            let tags = [];
            item.icons[0].split(",").forEach((icon) => {
                switch (icon) {
                    case "23": tags.push("B");
                    break;
                    case "24": tags.push("Vegan");
                    break;
                    case "45": tags.push("Sch");
                    break; 
                    case "46": tags.push("R");
                    break; 
                    case "47": tags.push("R");
                    break; 
                    case "48": tags.push("L");
                    break; 
                    case "49": tags.push("G");
                    break; 
                    case "50": tags.push("F");
                    break;
                    case "51": tags.push("Veg");
                    break; 
                    case "52": tags.push("W");
                    break; 
                }                    
            });

            if (item.title && item.title[0].includes("Fleischbällchen")) {
                item.title[0] = item.title[0].replace("Fleischbällchen", "leischbällchen");
            } 
            let dish = {
                Name: item.title ? item.title[0] : "",
                Category: item.category ? item.category[0]: "",
                Pricing: item.preis1 ? item.preis1[0] + " €" : "",
                PricingSchool: item.preis2 ? item.preis2[0] + " €": "",
                PricingEmp: item.preis3 ? item.preis3[0] + " €" : "",
                PricingGuest: item.preis4 ? item.preis4[0] + " €": "",
                Tags: tags
            }

            if (item.einheit && item.einheit[0]) {
                dish.Pricing = dish.Pricing + `/${item.einheit[0]}g `;
                dish.PricingSchool = dish.PricingSchool + `/${item.einheit[0]}g `;
                dish.PricingEmp = dish.PricingEmp + `/${item.einheit[0]}g `;
                dish.PricingGuest = dish.PricingGuest + `/${item.einheit[0]}g `;
            }

            //fix BBQ section
            if (dish.Category === "Gießberghütte" || dish.Category === "BBQ") {
                dish.Pricing = "-";
                dish.PricingSchool = "-";
                dish.PricingEmp = "-";
                dish.PricingGuest = "-";
            }
            menu.dishes.push(dish)
        });
        menus.push(menu);
    });
    return menus;
}

/**
 * Returns all supplements found in a string
 * @param {*} string String with supplement list in the form of /\(\d.*\)/
 */
function getSupplements(string) {
    if (!string) {
        return [];
    }
    let ingredients = string.split("|");
    let supplements = [];
    ingredients.forEach((ing) => {
        let res = ing.match(/\(\d.*\)/);
        if (res) {
            res = res[0].replace("(", "").replace(")", "");
            res.split(",").forEach((elem) => {
                if (!supplements.includes(elem)) {
                    supplements.push(elem);
                }
            });
        }
    })
    return supplements.sort();
}

/**
 * Removes all items with the exclude tags or supplements
 * @param {*} menuItems String menu
 * @param {*} includeTags Array with tags as strings (Veg, Vegan, Sch, R, G, L, W, F, B)
 * @param {*} excludeSup Array with supplements as strings.
 */
function filterMenu(menus, excludeSup, includeTags) {
    menus.forEach((menu) => {
        let filtered = [];
        menu.dishes.forEach((item) => {
            let tags = item.Tags;
            let supplements = getSupplements(item.Name);
            if (!excludeSup) {
                console.log("not");
            }
            if (includeTags) {
                if (includeTags && tags.find(m => includeTags.includes(m)) && !supplements.some(m => excludeSup.includes(m))) {
                    filtered.push(item);
                }
            } else if (!supplements.some(m => excludeSup.includes(m))) {
                filtered.push(item);
            }
        });
        menu.dishes = filtered;
    })
    return menus;
}

function handleApiV2Get(req, res) {
  if ((req.query.includeTags && req.query.includeTags.length != 0) || req.query.excludeSup.length != 0) {
      console.log("API v2: GET received from " + req.ip + " for " + req.query.mensa + " with query " + "exclude_sups=(" + req.query.excludeSup + ") include_tags=(" + req.query.includeTags + ")");
      console.log("API v2: User Agent: " + req.get('User-Agent'));
  } else {
      console.log("API v2: GET received from " + req.ip + " for " + req.query.mensa)
      console.log("API v2: User Agent: " + req.get('User-Agent'));
  }
  http.get(req.query.langURL, (httpRes) => {
      const { statusCode } = httpRes;
      const contentType = httpRes.headers['content-type'];

      let error;
      if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
              `Status Code: ${statusCode}`);
      } else if (!/^[a-zA-Z]+\/xml/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
              `Expected [a-zA-Z]/xml but received ${contentType}`);
      }
      if (error) {
          console.error(error.message);
          // Consume response data to free up memory
          httpRes.resume();
          return;
      }

      httpRes.setEncoding('utf8');
      let rawData = '';
      httpRes.on('data', (chunk) => { rawData += chunk; });
      httpRes.on('end', () => {
          parseString(rawData, function (err, result) {
              if (err) {
                  res.send("it's all fucked up m8").status(503);
                  return;
              }
              res.json(filterMenu(convertXmltoJson(result), req.query.excludeSup, req.query.includeTags)).status(200);
          });
      });
  }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
  });
}

function parseQuery(req, res, next) {
    if (!req.query.lang) {
        req.query.lang = "de";
        req.query.langURL = seezeitDE;
    } else if (req.query.lang !== "de" && req.query.lang !== "en") {
        req.query.lang = "de";
        req.query.langURL = seezeitDE;
    } else if (req.query.lang === "en") {
        req.query.langURL = seezeitEN;
    } else if (req.query.lang === "de") {
        req.query.langURL = seezeitDE;
    }

    if (!req.query.mensa && req.query.lang === "de") {
        req.query.mensa = defaultMensaDE;
    } else if (!req.query.mensa && req.query.lang === "en") {
        req.query.mensa = defaultMensaEN;
    }
    const supplements = [];
    if (Array.isArray(req.query.excludeSup) || Array.isArray(req.query.includeTags)) {
        res.send("400: Bad request boi. Do not send multiple queries of the same name!").status(400);
        return;
    }

    if (req.query.excludeSup) {
        req.query.excludeSup.split(",").forEach((elem) => {
            if (!supplements.includes(elem)) {
                supplements.push(elem);
            }
        });
    }
    req.query.excludeSup = supplements;

    if (req.query.includeTags) {
        const tags = [];
        req.query.includeTags.split(",").forEach((elem) => {
            if (!tags.includes(elem)) {
                tags.push(elem);
            }
        });
        req.query.includeTags = tags;
    }
    next();
}

function convertQueryToXmlFormat(req, res, next) {
    if (req.query.langURL === seezeitDE) {
        req.query.langURL = seezeitXmlDE.replace("%i", req.query.mensa.replace("-", "_"));
    } else if (req.query.langURL === seezeitEN) {
        if (req.query.mensa === defaultMensaEN) {
            req.query.mensa = defaultMensaDE;
        }
        req.query.langURL = seezeitXmlEN.replace("%i", req.query.mensa.replace("-", "_"));
    }
    next();
}

app.get("/", cors(), parseQuery, convertQueryToXmlFormat, handleApiV2Get);

export default {
  handler: app,
  path: '/api'
}