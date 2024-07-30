const express = require('express');
const mongoose = require('mongoose');
const Leakage = require('./models/leakage');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/leakage_form');

app.put('/leakage_form/:id', async (req, res) => {
  const id=req.params.id
  const { date, skuName, rejectCount, actualCount, totalCount,operation } = req.body
  
  if (rejectCount >= actualCount || actualCount >= totalCount) {
    return res.status(400).json({ error: 'Validation error' });
  }
  try {
    console.log(id,req.body)
    const updatedEntry = await Leakage.findByIdAndUpdate(
      id,
      { date, skuName, rejectCount, actualCount, totalCount, operation }
    );
    console.log('updatedentry',updatedEntry)
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }

});

app.get('/leakage_form', async (req, res) => {
    try {
      const filter=req.query.filter
      let data;

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const todayFormatted = `${year}-${month}-${day}`;

      if(filter==='Today'){
        data = await Leakage.find({  
        date: {
          $regex: todayFormatted
        },
        actualCount: null});
      }else if(filter==='Pending'){
        data = await Leakage.find({actualCount: null});
      }
      else{
        data = await Leakage.find({
          date: {
            $regex: todayFormatted
          },
          actualCount: { $ne: null } 
        });
      }
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching data' });
    }
  });
  

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
