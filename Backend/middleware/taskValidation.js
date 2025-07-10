const zod = require("zod");

const statusOptions = ['Todo', 'In Progress', 'Done'];
const priorityOptions = ['Low','Medium','High'];

const taskSchema = zod.object({
    title: zod.string().min(3, "Title must be at least 3 characters long").refine((val)=> !statusOptions.includes(val),{
        message: "Title cannot be the same as column names"
    }),
    description: zod.string().optional(),
    priority: zod.enum(['Low','Medium','High']).optional(),
    status: zod.enum(['Todo', 'In Progress', 'Done']).optional(),
    assignedTo: zod.string().optional()
});

const validateTask = (req,res,next)=>{
    const result = taskSchema.safeParse(req.body);

    if(!result.success){
        const errors = result.error.issues.map((issue)=> issue.message);
        return res.status(400).json({errors});
    }
    next();
};

module.exports = {validateTask};