const api = 'https://srie.ceccsica.info';
const axios = require('axios');
var fs = require('fs');
var sleep = require('sleep');
let int = 0

const countryMap = {
  cr: 'costa-rica',
  bz: 'belice',
  sv: 'el-salvador',
  gt: 'guatemala',
  hn: 'honduras',
  ni: 'nicaragua',
  pa: 'panama',
  do: 'republica-dominicana'
}

const createPdf = async (indicator, country) => {
  const {data: {variations}} =  await axios.get(`${api}/api/indicators/${indicator}`)
  
  if (variations.length !== 0) {
    variations.forEach(async (variation, index) => {
      int++
      await callPdf(country, indicator, variation.code)
     
    })
  } else {
    int++
    await callPdf(country, indicator, '')
  }
  
}

const tabsOrder = [ 'total', 'sex', 'wealth-quintile', 'location', 'indexes' ];


const callPdf = async (country, indicator, variationCode) => {
  setTimeout(async () => {
    console.log(`Processing indicator ${indicator}`)
    const {data} = await axios.get(`${api}/api/indicators/${indicator}/data?country=${country}`)
    const charData = data[variationCode? `${indicator}.${variationCode}`: indicator].visualizations;
    const indexes = data[variationCode? `${indicator}.${variationCode}`: indicator].indexes;
    const tabsToShow = [...Object.keys(data[variationCode? `${indicator}.${variationCode}`: indicator].visualizations), ...['indexes']];
    const variationParam = variationCode ? `&indicatorVariation=${indicator}.${variationCode}` : '';

    tabsToShow.forEach(async (tab, index) => {
      setTimeout(async () => {
        if (charData[tab] && charData[tab].historical.length > 0) {
        const axiosOptions = {
          url: 'http://localhost:9000/api/render',
          method: 'POST',
          responseType: 'stream',
          data: {
            "url": `${api}/${countryMap[country]}/indicator-share/${indicator}?share=true&hideSideBar=true&type=table&defaultChartMetrics=historical&tabNumber=${index + 1}${variationParam}`,
            "goto": {
              "timeout": 0
            },
            "pdf": {
              "landscape": true,
              "width": "800",
              "height": "1400"
            },
            "scrollPage": true,
            "screenshot": {
              "type": "png"
            },
            "output": "pdf",
            "viewport": {
              "isLandscape": true
            },
            "output": "screenshot"
          }
        }
        const response = await axios(axiosOptions)
        response.data.pipe(fs.createWriteStream(variationCode ?  `./pdfs/${country}/${indicator}/${tab}-${variationCode}.png` : `./pdfs/${country}/${indicator}/${tab}.png`), { end: false });
        }
      }, 12000* index)
      
    })
    if (indexes) {
      let cont = 0;
      console.log(variationParam)
      Object.keys(indexes).forEach(i => {
        setTimeout(async () => {
          const url = `${api}/${countryMap[country]}/indicator-share/${indicator}?share=true&hideSideBar=true&type=table&defaultChartMetrics=historical&tabNumber=${tabsToShow.indexOf('indexes') + 1}${variationParam}&indexe=${i}`
          const axiosOptions = {
            url: 'http://localhost:9000/api/render',
            method: 'POST',
            responseType: 'stream',
            data: {
              url,
              "goto": {
                "timeout": 0
              },
              "pdf": {
                "landscape": true,
                "width": "800",
                "height": "1400"
              },
              "scrollPage": true,
              "screenshot": {
                "type": "png"
              },
              "output": "pdf",
              "viewport": {
                "isLandscape": true
              },
              "output": "screenshot"
            }
          }
          const filename = variationCode ?  `./pdfs/${country}/${indicator}/indixes-${i}-${variationCode}.png` : `./pdfs/${country}/${indicator}/indixes-${i}.png`
          const response = await axios(axiosOptions)
          response.data.pipe(fs.createWriteStream(filename, { end: false }));
        }, 12000 * ++cont )
      })
    }
  },12000 * int)
}

const generateDashboard = async (country, tab) => {
  const axiosOptions = {
    url: 'http://localhost:9000/api/render',
    method: 'POST',
    responseType: 'stream',
    data: {
      "url": `${api}/${countryMap[country]}/share?share=true`,
      "goto": {
        "timeout": 0
      },
      "pdf": {
        "landscape": true,
        "width": "800",
        "height": "1400"
      },
      "scrollPage": true,
      // "screenshot": {
      //   "type": "png"
      // },
      "output": "pdf",
      "viewport": {
        "isLandscape": true
      },
      "output": "pdf"
    }
  }
  const response = await axios(axiosOptions)
  response.data.pipe(fs.createWriteStream(`./pdfs/${country}/dashboard/${country}.pdf`), { end: false });
}

module.exports = { createPdf, generateDashboard }