const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const mongoose = require('mongoose');
const Leakage = require('./models/leakage');

mongoose.connect('mongodb://localhost:27017/leakage_form');

const skuMappings = {
  1: 'tm_1000',
  2: 'tm_500',
  3: 'tm_160',
  4: 'dtm_900',
  5: 'dtm_150',
  6: 'std_400',
  11: 'tm_120'
};

function getMappedData(row, previousRow) {
  const skus = ['M1HAV', 'M1HBV', 'M2HAV', 'M2HBV', 'M3HAV', 'M3HBV'];
  const counts = ['M1HAC', 'M1HBC', 'M2HAC', 'M2HBC', 'M3HAC', 'M3HBC'];

  const result = [];

  for (let i = 0; i < skus.length; i++) {
    const skuKey = skus[i];
    const countKey = counts[i];
    isSkuChanged=false
    const currentSkuNumber = row[skuKey];
    const previousSkuNumber = previousRow ? previousRow[skuKey] : null;

    if (skuMappings[currentSkuNumber]) {
      let skuName = skuMappings[currentSkuNumber];
      let totalCount = row[countKey];

      if (previousRow && currentSkuNumber !== previousSkuNumber) {
        skuName = skuMappings[previousSkuNumber];
        totalCount = previousRow[countKey];
        isSkuChanged = true;
      }

      result.push({skuKey,skuName, totalCount, isSkuChanged });
    }
    else{
      result.push({undefined,undefined,undefined,undefined})
    }

  }

  return result;
}

const results = [];
const uniqueSkuCounts = {};

const filePath = path.resolve('C:\\Users\\RAVIN\\Downloads\\SampleData.csv');
let previousRow = null;


fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    const mappedData = getMappedData(row, previousRow);

    mappedData.forEach(({ skuKey,skuName, totalCount, isSkuChanged }) => {

      if (skuName && ( isSkuChanged)) {   

            if(totalCount!=='0')          
            {          
              uniqueSkuCounts[skuName] = totalCount;
            }
            else if(totalCount==='0' )      
            {                         
              row[skuKey]=null
            }
      }
    });
  
    previousRow = Object.assign({}, row);

  })
  .on('end', async () => {
   
    for (const [skuName, totalCount] of Object.entries(uniqueSkuCounts)) {
      results.push({
        date: getDate(),
        skuName,
        rejectCount: 0,
        actualCount: null,
        totalCount,
        operation: 'save',
      });
    }

    try {
      await Leakage.insertMany(results);
      console.log('Data successfully saved to MongoDB');
    } catch (error) {
      console.error('Error saving data to MongoDB:', error);
    } finally {
      mongoose.connection.close();
    }
  });

  const getDate=()=>{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const todayFormatted = `${year}-${month}-${day}`;
    return todayFormatted
  }

