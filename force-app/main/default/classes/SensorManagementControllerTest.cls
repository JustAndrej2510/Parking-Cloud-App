@isTest
private class SensorManagementControllerTest {
    @testSetup
    static void prepareTestData(){
        List<Base_Station__c> testStations = new List<Base_Station__c>();
        testStations.add(new Base_Station__c(Name = 'Earth', Status__c = 'Active'));
        testStations.add(new Base_Station__c(Name = 'Uranus', Status__c = 'Inactive'));
        testStations.add(new Base_Station__c(Name = 'Neptune', Status__c = 'Broken'));
        insert testStations;
    }

    
    @isTest static void testReadCSVDataPositiveCase(){
        String testData = 'Sensor_model__c,Status__c,Base_Station__c\n' +
                            'Tambee,Inactive,Earth\n' +
                            'Wordify,Inactive,Uranus\n' +
                            'Topicstorm,Active, ';

        String fileId = TestDataFactory.createTestCSVFile(testData);                
        List<Sensor__c> resultDataList = SensorManagementController.readCSVData(fileId);
        System.assertEquals(3, resultDataList.size());

    }

    @isTest static void testReadCSVDataEmptySensorModelExceptionCase(){
        String testData = 'Sensor_model__c,Status__c,Base_Station__c\n' +
                            ' ,Inactive,Earth';

        String fileId = TestDataFactory.createTestCSVFile(testData); 
        Boolean occuredException = false;
        try{
            SensorManagementController.readCSVData(fileId);
        }
        catch(Exception ex){
            occuredException = true;
        }
        System.assert(occuredException, 'Expected empty Sensor Model field exception');
    }

    @isTest static void testReadCSVDataInvalidStatusExceptionCase(){
        String testData = 'Sensor_model__c,Status__c,Base_Station__c\n' +
                            'Aleksey,Broken,Earth';
        String fileId = TestDataFactory.createTestCSVFile(testData); 
        Boolean occuredException = false;
        try{
            SensorManagementController.readCSVData(fileId);
        }
        catch(Exception ex){
            occuredException = true;
        }
        System.assert(occuredException, 'Expected invalid Status field exception');
    }

    @isTest static void testReadCSVDataNullDocumentIdExceptionCase(){
        Boolean occuredException = false;
        try{
            SensorManagementController.readCSVData(null);
        }
        catch(Exception ex){
            occuredException = true;
        }
        System.assert(occuredException, 'Expected null Document Id exception');
    }

    @isTest static void testReadCSVGeneralExceptionCase(){
        Boolean occuredException = false;
        try{
            Id fakeId = '0685j000002pinGAAQ';
            SensorManagementController.readCSVData(fakeId);
        }
        catch(Exception ex){
            occuredException = true;
        }
        System.assert(occuredException, 'Expected Script-throw exception');
    }
    
    @isTest static void testDeleteSensorPositiveCase(){
        Sensor__c sensor = new Sensor__c(Sensor_model__c = 'model', Status__c = 'Inactive');
        insert sensor;
        System.debug('Sensor: ' + [SELECT Id, Sensor_model__c FROM Sensor__c WHERE Id =: sensor.Id]);
        SensorManagementController.deleteSensor(sensor.Id);
        List<Sensor__c> checkSensorList = [SELECT Id, Sensor_model__c FROM Sensor__c WHERE Id =: sensor.Id];
        System.assertEquals(0,checkSensorList.size());

    }

    @isTest static void testDeleteSensorNullIdExceptionCase(){
        Boolean occuredException = false;
        try{
            SensorManagementController.deleteSensor(null);
        }
        catch(Exception ex){
            occuredException = true;
        }
        System.assert(occuredException, 'Expected invalid Id exception');
    }

    @isTest static void testDeleteSensorInvalidIdExceptionCase(){
        Boolean occuredException = false;
        try{
            Id fakeId = '0685j000002pinGAAQ';
            SensorManagementController.deleteSensor(fakeId);
        }
        catch(Exception ex){
            occuredException = true;
        }
        System.assert(occuredException, 'Expected invalid Id exception');
    }

    @isTest static void testGetSensors(){
        TestDataFactory.createSensors('test', 'Inactive', 15);
        List<Sensor__c> sensorList = SensorManagementController.getSensors(0, 10);
        System.assertEquals(10,sensorList.size());

    }

    @isTest static void testGetCountSensors(){
        TestDataFactory.createSensors('test', 'Inactive', 15);
        Integer count = SensorManagementController.getCountSensors();
        System.assertEquals(15,count);

    }
   
}