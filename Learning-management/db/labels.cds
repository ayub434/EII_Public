using { TrainingManagementSystem } from './schema';

annotate TrainingManagementSystem.Employees with 
{
    employeeID   @title: '{i18n>EmployeeID}';
    fullName     @title: '{i18n>FullName}';
    email        @title: '{i18n>Email}';
    phonenumber  @title: '{i18n>PhoneNumber}';
    jobRole      @title: '{i18n>JobRole}';
    department  @title: '{i18n>Department}';
    location     @title: '{i18n>Location}';
    lineManager  @title: '{i18n>LineManager}';
    status       @title: '{i18n>Status}';
}

annotate TrainingManagementSystem.TrainingModules with 
{
    title              @title: '{i18n>TrainingModuleTitle}';
    description        @title: '{i18n>TrainingModuleDescription}';
    trainingType       @title: '{i18n>TrainingType}';
    durationMins       @title: '{i18n>DurationInMinutes}';
    provider           @title: '{i18n>Provider}';
    isMandtory         @title: '{i18n>IsMandatory}';
    tmsProvider        @title: '{i18n>TMSProvider}';
    tmsCourseID        @title: '{i18n>TMSCourseID}';
    validMonths        @title: '{i18n>ValidMonths}';
    complaince         @title: '{i18n>Compliance}';
}

annotate TrainingManagementSystem.TrainingSessions with 
{
    module              @title: '{i18n>TrainingModule}';
    sessionTitle        @title: '{i18n>SessionTitle}';
    trainerName         @title: '{i18n>TrainerName}';
    sessionTopic        @title: '{i18n>SessionTopic}';
    startDate           @title: '{i18n>StartDate}';
    startTime           @title: '{i18n>StartTime}';
    endDate             @title: '{i18n>EndDate}';
    endTime             @title: '{i18n>EndTime}';
    location            @title: '{i18n>Location}';
    capacity            @title: '{i18n>Capacity}';
    status              @title: '{i18n>Status}';
}

annotate TrainingManagementSystem.SessionEnrollments with 
{
    session               @title: '{i18n>TrainingSession}';
    employee              @title: '{i18n>Employee}';
    attendance            @title: '{i18n>Attendance}';
    enrolledDate          @title: '{i18n>EnrolledDate}';
}

Annotate TrainingManagementSystem.LearningRoadmap with 
{
    code               @title: '{i18n>LearningRoadmapCode}';
    title              @title: '{i18n>LearningRoadmapTitle}';
    description        @title: '{i18n>LearningRoadmapDescription}';
}

Annotate TrainingManagementSystem.TrainingTypes with 
{
    code               @title: '{i18n>TrainingTypeCode}';
    
}

Annotate TrainingManagementSystem.Departments with 
{
    code               @title: '{i18n>DepartmentCode}';
    name              @title: '{i18n>DepartmentName}';
}

Annotate TrainingManagementSystem.Locations with 
{
    code               @title: '{i18n>LocationCode}';
    name              @title: '{i18n>LocationName}';
    
}

Annotate TrainingManagementSystem.LearningRoadmapModules with 
{
    roadmap                   @title: '{i18n>LearningRoadmap}';
    module                    @title: '{i18n>TrainingModule}';
    sequenece                 @title: '{i18n>Sequence}';
    isRequired                @title: '{i18n>IsRequired}';
}

Annotate TrainingManagementSystem.Statuses with 
{
    code               @title: '{i18n>StatusCode}';
    
}





