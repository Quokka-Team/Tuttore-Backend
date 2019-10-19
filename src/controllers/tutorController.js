'use strict'

const Student = require('../models/student');
const service = require('../services/index_services');
const Course = require('../models/course');




async function registerTutor(req, res){
    
    const id_student = req.student;

    const addFields = {
        courses: [],
        description: req.body.description,
        isTutor: true,
        dateCreatedTutor: new Date()
    };

    Student.update({_id:id_student}, addFields, (err, result)=>{
        if (err) return res.status(500).send({message: 'Server Failed', err:err});
        res.status(201).send({message:'The user has become a tutor'});
    });
    
   
}

async function addCourseTutor(req, res){

    const id_tutor = req.student;
    const id_course = req.body.idCourse;

    const newCourse ={
        courseId: id_course,
        gpa:0,
        score:0,
        initialDate: new Date()
    }

    const newTutor = {
        initialDate: new Date(),
        tutor: id_tutor,
        gpa:0,
        score:0
    }


    Student.findOne({_id:id_tutor}, (err, student) =>{
        
        if (err) return res.status(500).send({message: 'Server Failed Getting Tutor', err:err});
        if (!student.isTutor) return res.status(400).send({message: 'Student is not a tutor'});
        student.courses.push(newCourse);

        Student.update({_id:id_tutor}, {courses:student.courses}, (err, result)=>{
            if (err) return res.status(500).send({message: 'Server Failed Adding Tutor Course', err:err});
            
            Course.findOne({_id:id_course}, (err, course) =>{

                if (err) return res.status(500).send({message: 'Server Failed Getting Course', err:err});
                course.avaibleTutors.push(newTutor);
        
                Course.update({_id:id_course}, {avaibleTutors:course.avaibleTutors}, (err, result)=>{

                    if (err) return res.status(500).send({message: 'Server Failed Adding Course Tutor', err:err});
                    res.status(200).send({message: 'course added correctly'});

                });
            });
        });

    });
}



async function getTutor(req, res){
    let idTutor;
    if(req.body.idTutor == 'this'){
        idTutor = req.student;
    }
    else{
        idTutor = req.body.idTutor;
    }
    let tutor;
    try{
        tutor = await Student.findOne({_id:idTutor}).exec();
    }
    catch(err){
        res.status(500).send({
            message: 'error getting tutor',
            err: err
        });
    }
    
    let newTutor = {
        name: tutor.name,
        lastName: tutor.lastName,
        email: tutor.email,
        career: tutor.career,
        gpa: tutor.gpa, 
        phoneNumber: tutor.phoneNumber,
        description: tutor.description,
        dateCreatedTutor: tutor.dateCreatedTutor,
        courses:[]
    }
    
    // add try catch
    try{
        newTutor.courses = await getInformationCourses(tutor.courses);
    }
    catch(err){
        res.status(500).send({
            message: 'error getting tutor courses',
            err: err
        });
    }
    res.status(200).send(newTutor);

}

//Funcion auxiliar de get tutor
async function getInformationCourses(idCourses){
    let courses =[];
    for(let i = 0; i<idCourses.length; i++){
        let id_course = idCourses[i].courseId;
        let course = await Course.findOne({_id:id_course}).exec();
        let newCourse = {
            idCourse: id_course,
            name: course.name,
            code: course.code,
            gpa: idCourses[i].gpa,
            score: idCourses[i].score
        }
        courses.push(newCourse);
    }
    return courses;
}




async function getTutorsByCourse(req, res){
    let id_course = req.body.idCourse;

    let course;
    
    try{
        course = await Course.findOne({_id:id_course}).exec();
    }
    catch(err){
        res.status(500).send({
            message: 'Server Failed Getting Course',
            err: err
        });
    }
    let getCourse = {
        idCourse:id_course,
        name:course.name,
        code: course.code,
        avaibleTutors:[]
    }
    try{
        getCourse.avaibleTutors = await getInformationTutors(course.avaibleTutors);
    }
    catch(err){
        res.status(500).send({
            message: 'Server Failed Getting Information Tuttors',
            err: err
        });
    }
    res.status(200).send(getCourse);

}


async function getInformationTutors(getTutors){
    let tutors = [];
    for(let i = 0; i<getTutors.length; i++){
        let tutor = await Student.findOne({_id:getTutors[i].tutor}).exec();
        tutors.push({
            idTutor: tutor.id,
            name: tutor.name,
            lastName: tutor.lastName,
            carrer: tutor.carrer,
            description: tutor.description,
            initialDate:getTutors[i].initialDate,
            gpa: getTutors[i].gpa,
            score: getTutors[i].score
        });
    }
    return tutors;
}



async function getNewTutors(req, res){
    let numberTutors = parseInt(req.body.numberTutors);
    try{
        let tutors = await Student.find({isTutor: true}).sort({dateCreatedTutor:'desc'}).limit(numberTutors).select('-password -availability -chat -__v -courses._id').exec();
        res.status(200).send(tutors);
    }
    catch(err){
        res.status(500).send({
            message: 'Server Failed Getting Tutors',    
            err:err
        });
    }
}


async function getNewTutorsByCourse(req, res){
    let course;
    let numberTutors = parseInt(req.body.numberTutors);
    try{
        course = await Course.findOne({_id:req.body.idCourse}).exec();
    }
    catch(err){
        res.status(500).send({
            message: 'Sever Failed Getting Course',
            err,err
        });
    }


    let idTutors =[];
    for(let i=0; i<course.avaibleTutors.length; i++){
        idTutors.push({ 
                        id:course.avaibleTutors[i].tutor, 
                        initialDate:course.avaibleTutors[i].initialDate,
                        gpa: course.avaibleTutors[i].gpa,
                        score: course.avaibleTutors[i].score 
                    });
    }

    idTutors.sort(function(a, b){
        if(a.initialDate<b.initialDate){return 1;}
        if(a.initialDate>b.initialDate){return -1;}
        return 0;
    });
    idTutors = idTutors.slice(0,numberTutors);

    let tutors = [];

    try{
        for(let i = 0; i<idTutors.length; i++){
            let tutor = await Student.findOne({_id:idTutors[i].id}).exec();
            tutors.push({
                idTutor: tutor.id,
                name: tutor.name,
                lastName: tutor.lastName,
                email: tutor.email,
                carrer: tutor.carrer,
                description: tutor.description,
                initialDate:idTutors[i].initialDate,
                gpa: idTutors[i].gpa,
                score: idTutors[i].score
            });
        }
    }
    catch(err){
        res.status(500).send({
            message: 'Sever Failed Getting Information tutors',
            err,err
        });
    }
    
    res.status(200).send(tutors);

}



module.exports = { registerTutor, addCourseTutor, getTutor, getTutorsByCourse, getNewTutors, getNewTutorsByCourse}
