// Importing the 'mongoose' library
const mongoose = require('mongoose');

// Creacting a schema using the 'Schema' class from mongoose
const Schema = mongoose.Schema;

// Defining a schema for the 'customersAuth' collections in MongoDB
const customersSchema = new Schema({
    // Field for storing the user's 
    user_name: {
        type: String, 
        required: true,
    },
    password: {
        type: String, 
        required: true,
    },
    email: {
        type: String, 
        required: true,
    },
});

// Creating a model from the schema.

const CustomersModel = mongoose.model('customers', customersSchema);

// Exporting the customersModel
module.exports = CustomersModel;
