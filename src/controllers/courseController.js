'use strict'

const mongoose = require('mongoose');
const Course = require('../models/course');
const Student = require('../models/student');





async function addCourse(req, res){
    const dateNow = new Date();
    const course = new Course({
        name:req.body.name,
        code:req.body.code,
        dateCreated:dateNow,
        avaibleTutors:[]
    });
    course.save((err)=>{
        if (err) res.status(500).send({message: 'Error adding the course',  err:err});

        res.status(201).send({message: 'Course succesfully added'});
    });

}




async function getAllCourses(req, res){
   Course.find({}, (err, courses)=>{
        if (err) return res.status(500).send({message: 'Server Failed'});
        res.status(200).send(courses);
    }).select('-avaibleTutors -__v ');
}



async function getNewCourses(req, res){
    let numberOfNewCourses = parseInt(req.params.numberCourses);
    Course.find({}).sort({dateCreated: 'desc'}).select('-avaibleTutors -__v ').limit(numberOfNewCourses).exec( (err, courses) => {
        if (err) return res.status(500).send({message: 'Server Failed'});
        res.status(200).send(courses);
    });
}



module.exports = {
    addCourse,
    getAllCourses,
    getNewCourses
}





















































// class CourseControler{
//     constructor() {

//         if (!!CourseControler.instance) {
//             return CourseControler.instance;
//         }

//         this.addCourse = async function(req, res){
//             const dateNow = new Date();
//             const course = new Course({
//                 name:req.body.name,
//                 code:req.body.code,
//                 dateCreated:dateNow,
//                 avaibleTutors:[]
//             });
//             course.save((err)=>{
//                 if (err) res.status(500).send({message: 'Error adding the course',  err:err});
        
//                 res.status(201).send({message: 'Course succesfully added'});
//             });
    
//         }


//         this.getAllCourses = async function(req, res){
//             Course.find({}, (err, courses)=>{
//                  if (err) return res.status(500).send({message: 'Server Failed'});
//                  res.status(200).send(courses);
//              }).select('-avaibleTutors -__v ');
//         }
        
//         this.getNewCourses =  async function(req, res){
//             let numberOfNewCourses = parseInt(req.params.numberCourses);
//             Course.find({}).sort({dateCreated: 'desc'}).select('-avaibleTutors -__v ').limit(numberOfNewCourses).exec( (err, courses) => {
//                 if (err) return res.status(500).send({message: 'Server Failed'});
//                 res.status(200).send(courses);
//             });
//         }

        
    
//         CourseControler.instance = this;
    

//         return this;    
    
//     }
    
// }


  
    
    
    
    






// const courseControler = new CourseControler();
// const addCourse = courseControler.addCourse;
// const getAllCourses = courseControler.getAllCourses;
// const getNewCourses = courseControler.getNewCourses;

// module.exports = {
//     addCourse,
//     getAllCourses,
//     getNewCourses
// }