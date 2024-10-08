const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle ware 
app.use(cors());
app.use(express.json());

//BhJxLRKZ3OvzsrUk
//cartItems


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8iumwdu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("cartItems").collection("products");

    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10;
      const Brand = req.query.brand_name;
      const CategoryName = req.query.category_name;
      const PriceRange = req.query.price;
      const sortOption = req.query.sorting;
      const skip = (page - 1) * limit;
      const search = req.query.search;

      let query = {};
    
      if (Brand) {
        query = { brand_name: Brand }; 
      }
      if (CategoryName) {

        query.category_name = CategoryName;
         
      }


      if(PriceRange){
        const [minPrice, maxPrice] = PriceRange.split('-').map(Number);
        query.price = { $gte: minPrice, $lte:maxPrice};
      }

      let sortQuery = {};

      if (sortOption) {
        if (sortOption === "Price: Low to High") {
          sortQuery.price = 1; 
        } else if (sortOption === "Price: High to Low") {
          sortQuery.price = -1; 
        } else if (sortOption === "Latest") {
          sortQuery.creation_date = -1; 
        }
      }

      if (search) {
        query.product_name = {
          $regex: search,
          $options: "i",
        };
      }

      console.log(search);
      
      const cursor = productsCollection
        .find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      const result = await cursor.toArray();
      const totalItems = await productsCollection.countDocuments(query); 
      const totalPages = Math.ceil(totalItems / limit); 

      res.send({
        products: result,
        totalItems,
        totalPages,
        currentPage:page,
});
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('volunteer hub server is running')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})