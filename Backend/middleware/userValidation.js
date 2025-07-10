const zod = require("zod");
const { schema } = require("../models/user");

const registrationSchema = zod.object({
    username: zod.string().min(3,"Username must be atleast 3 characters"),
    email: zod.string().email("invalid email"),
    password: zod.string().min(6, "password must be atleast 6 characters" ),

});

const loginSchema = zod.object({
    email: zod.string().email("Invalid Email"),
    password: zod.string().min(1, "Password is required"),
});


const validate = (schema)=> (req, res,next)=>{
    const result = schema.safeParse(req.body);
    if(!result.success){
        const errorMessage = result.error.issues.map((issue)=> issue.message);
        return res.status(400).json({errors: errorMessage});
    }
    next();
};

module.exports = {
    validateRegister: validate(registrationSchema),
    validateLogin:validate(loginSchema),
};