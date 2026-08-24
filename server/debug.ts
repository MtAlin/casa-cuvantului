import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Assuming scratch directory is used, we load env from the server dir
dotenv.config({ path: 'C:\\Users\\Mt Alin\\Downloads\\casa-cuvântului (1)\\server\\.env' });

const uri = process.env.MONGO_URI || 'mongodb+srv://mateialin92:Tania842004@cluster0.ojd8ju9.mongodb.net/disciplebookplanner?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Load schema
    const userStudyPlanSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      studyPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan' },
      status: String,
      completedGroups: Array
    });
    const UserStudyPlan = mongoose.model('UserStudyPlan', userStudyPlanSchema);
    
    const studyPlanSchema = new mongoose.Schema({
      title: String,
      isActive: Boolean
    });
    const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
    
    const plans = await UserStudyPlan.find().populate('studyPlanId').lean();
    console.log(JSON.stringify(plans, null, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
