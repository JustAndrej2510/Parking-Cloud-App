@isTest
public class TestDataFactory {
    public static Id createTestCSVFile(String data){
        ContentVersion testContentVersion = new ContentVersion(
            Title = 'Sensors',
            PathOnClient = 'Sensors',
            VersionData = Blob.valueOf(data),
            IsMajorVersion = true
        );
        insert testContentVersion;
        System.debug(testContentVersion);
        List<ContentVersion> contentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = 'Sensors' LIMIT 1];
        System.debug(contentId[0].ContentDocumentId);
        return contentId[0].ContentDocumentId;
    }

    public static List<Sensor__c> createSensors(String model, String status, Integer count){
        List<Sensor__c> sensorList = new List<Sensor__c>();
        for(Integer i = 0; i<count; i++){
            Sensor__c sensor = new Sensor__c(Sensor_model__c = model, Status__c = status);
            sensorList.add(sensor);
        }
        
        if(!sensorList.isEmpty()){
            insert sensorList;
            return sensorList;
        }
        else{
            return null;
        }
       
    }
}