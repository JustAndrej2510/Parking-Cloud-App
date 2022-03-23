public with sharing class PaginationMetadata {
    @AuraEnabled(cacheable=true)
    public static List<Pagination_Metadata__mdt> fetchPaginationMetadata(){
        return [SELECT Amount_Records__c FROM Pagination_Metadata__mdt Order by Amount_Records__c];
    }

    @AuraEnabled(cacheable=true)
    public static Pagination_Metadata__mdt getDefaultSize(){
        return [SELECT Amount_Records__c FROM Pagination_Metadata__mdt Order by Amount_Records__c LIMIT 1];
    }
}