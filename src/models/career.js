'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CareerSchema = new Schema({
    name : String,
    faculty : String
});