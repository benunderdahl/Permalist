import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import "dotenv/config"

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const client = new pg.Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB
})
client.connect()

async function getItems() {
  const response = await client.query("SELECT * FROM items ORDER BY id ASC;")
  const data = response.rows
  let items=[]
  data.forEach(item => {
    items.push(item)
  })
  return items
}

app.get("/", async (req, res) => {
  const items = await getItems()
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await client.query("INSERT INTO items (task) VALUES ($1);", [item])
  const items = await getItems()
  res.render("index.ejs", { listItems: items, listTitle: "Today"});
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId
  const task = req.body.updatedItemTitle
  await client.query("UPDATE items SET task = $2 WHERE id = $1", [id, task])
  const items = await getItems()
  res.render("index.ejs", {listItems: items, listTitle: "Today"})
});

app.post("/delete", async (req, res) => {
  const del = req.body.deleteItemId
  await client.query("DELETE FROM items WHERE id = $1", [del])
  const items = await getItems()
  res.render("index.ejs", {listItems:items, listTitle:"Today"})
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
