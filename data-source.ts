import { DataSource } from "typeorm";
import dbConfig = require("./ormconfig.js");

export default new DataSource(dbConfig as any);
