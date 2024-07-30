const fs = require('fs');
const csv = require('csv-parser');
const path=require('path')
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
    11: 'tm_120',
  };
  

  function getMappedData(row) {
    const skus = ['M1HAV', 'M1HBV', 'M2HAV', 'M2HBV', 'M3HAV', 'M3HBV'];
    const counts = ['M1HAC', 'M1HBC', 'M2HAC', 'M2HBC', 'M3HAC', 'M3HBC'];
  
    let skuName = '';
    let totalCount = 0;
  
    for (let i = 0; i < skus.length; i++) {
      const skuKey = skus[i];
      const countKey = counts[i];
  
      const skuNumber = row[skuKey];
      if (skuMappings[skuNumber]) {
        skuName = skuMappings[skuNumber];
        totalCount = row[countKey];
      }
    }
  
    return { skuName, totalCount };
  }

const results = [];

//pushing 3 sample data documents with current date for today's tab
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');

const todayFormatted = `${year}-${month}-${day} 00:00:00`;
for(let i of [1,2,3]){
    results.push({
        date: todayFormatted,
        skuName:'tm_1000',
        rejectCount:0, 
        actualCount:null, 
        totalCount:348,
        operation:'save'
    });
}   


const filePath = path.resolve('C:\\Users\\RAVIN\\Downloads\\SampleData.csv');
fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    const { skuName, totalCount } = getMappedData(row);
    results.push({
      date: row.TIME_STAMP,
      skuName,
      rejectCount:0, 
      actualCount:null, 
      totalCount,
      operation:'save'
    });
  })
  .on('end', async () => {
    try {
      await Leakage.insertMany(results);
      console.log('Data successfully saved to MongoDB');
    } 
    catch (error) {
      console.error('Error saving data to MongoDB:', error);
    }
    finally {
        mongoose.connection.close();
    }
  });
