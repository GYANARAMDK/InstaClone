const DataUriParser=require('datauri/parser.js')
const path=require('path')

const Parser= new DataUriParser();

const GetDataUri=(file)=>{
    const exName=path.extname(file.originalname).toString();
    return Parser.format(exName,file.buffer).content;
}
module.exports= GetDataUri;