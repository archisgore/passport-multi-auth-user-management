import passwordValidator from 'password-validator';
import passwordValidator from 'password-validator';

// Create a schema
var schema = new passwordValidator();

// Add properties to it
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.usingPlugin(validator.isEmail, 'Password should be an email');

export default  => {

}