const fs = require("fs");
const axios = require('axios');
const { Command } = require('commander');
const program = new Command();
const api = 'https://srie-staging.herokuapp.com';
const { createPdf, generateDashboard } = require('./command')

program.version('0.0.1');
program
  .option('-d, --dashboard <dashboard>', 'dashboard pdf')
  .option('-c, --country <country>', 'Country');

program.parse(process.argv);
if (program.country) {
  fs.mkdir(`./pdfs`, () => {
    fs.mkdir(`./pdfs/${program.country}`, function(err) {
      axios.get(`${api}/api/indicators`)
        .then(({ data }) => {
          data.map((indicator, index ) => {
            setTimeout(() => {
              fs.mkdir(`./pdfs/${program.country}/${indicator.id}`, (err)=> {
                createPdf(indicator.id,program.country).then((data) => {
                }).catch((err)=> console.log(err))
              })
            }, 2000*index )
          })
        })
      if (!err) {
        console.log("New directory successfully created.")
      } 
    })
  })
} else if (program.dashboard) {
  fs.mkdir(`./pdfs`, () => {
    fs.mkdir(`./pdfs/${program.dashboard}/dashboard`, async function(err) {
      await generateDashboard(program.dashboard)
    })
  })
}