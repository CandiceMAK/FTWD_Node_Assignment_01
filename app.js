// Require node packages
const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
//const path = required("path");

// Set up express server
const app = express();

// Apply middlewares
app.use(express.urlencoded({ extended: false}));
app.use(fileUpload());
app.use(express.static("statics"));

// Cache
let cache = {};

// Index rounting
app.get("/", (req, res) => {
    console.log(cache);
    res.sendFile(__dirname + "/index.html");
})

app.post("/", (req,res) => {
    console.log(req.body);
})

// Handle uploads
app.post("/files", (req,res) => {
    console.log(req.files.files);
    if (req.files) {
        const file = req.files.files;
        const fileName = file.name;
        const fileContent = file.data;
        cache[fileName] = write(fileName, fileContent).then(read);
        res.redirect("/");
    } else {
        console.log("Please select a file");
    }
});

//Handle downloads
app.get("/download/:id", (req, res) => {
    console.log("Dowload starting");
    if (cache[req.params.id]){
        console.log("Dowload from cache");
        cache[req.params.id].then((body) => {
            res.send(body);
            console.log("Dowload completed");
        });
    } else {
        cache[req.params.id] = read(`${req.params.id}`);
        cache[req.params.id].then((body) => {
            res.send(body);
            console.log("Download completed");
        })
    }
})

// Update the list of files
app.get("/update", (req, res) => {
    const fList = new Promise((resolve, reject) => {
        fs.readdir("./upload", (error, files) => {
            if (error) {
                reject(err);
            }
            resolve(files);
        });
    });

    fList.then((data) => {
        res.send(data);
        console.log("updated");
    });
});

app.get("/delete/:id", (req,res) => {
    console.log("deleting data")
    const fList = new Promise((resolve, reject) => {
        fs.unlink(`./upload/${req.params.id}`, (error) => {
            if(error){
                reject(err);
            }
            resolve();
        });
    });
    fList.then(() => {
        res.redirect("/");
    });
});

// Read and write functions
const read = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            __dirname + "/upload/" + fileName,
            (err, fileBuffer) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(fileBuffer);
                }
            }
        );
    });
};

const write = (fileName, content) => {
    console.log(`Uploading ${fileName}`);
    return new Promise((resolve, reject) => {
        fs.writeFile(
            __dirname + "/upload/" + fileName,
            content,
            (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(fileName);
                    console.log("Uploaded");
                }
            }
        );
    });
}

app.listen(8081, () =>{
    console.log("listening to 8081...")
})