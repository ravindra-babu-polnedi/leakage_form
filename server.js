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
 

  const result = validateCounts(rejectCount, actualCount, totalCount);
  console.log(result,'result')
  if (!result.valid) {
    return res.status(400).json(result)
  }

  if (!(rejectCount < actualCount) || !(actualCount < totalCount)) {
    return res.status(400).json({ error: 'Validation error: Reject Count should be less than Actual Count and Actual count should be less than Total count' });
  }
  

  try {
    console.log(id,req.body)
    const updatedEntry = await Leakage.findByIdAndUpdate(
      id,
      { date, skuName, rejectCount, actualCount, totalCount, operation }
    );
   
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
        // data = await Leakage.find({actualCount: null});
         data = await Leakage.find({  
          date: {
            $ne: todayFormatted
          },
          actualCount: null
        });
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


  function validateCounts(rejectCount, actualCount, totalCount) {
    // Helper function to validate a single count
    const isValidCount = (count) => {
        return typeof count === 'number' && count >= 0 && count <= 999999;
    };

    if (!isValidCount(rejectCount)) {
        return { valid: false, error: 'rejectCount must be a number between 0 and 999999' };
    }

    if (!isValidCount(actualCount)) {
        return { valid: false, error: 'actualCount must be a number between 0 and 999999' };
    }

    if (!isValidCount(totalCount)) {
        return { valid: false, error: 'totalCount must be a number between 0 and 999999' };
    }

    return { valid: true };
}


  

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
