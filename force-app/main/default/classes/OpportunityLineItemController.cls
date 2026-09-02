public with sharing class OpportunityLineItemController {





    @AuraEnabled(cacheable=true)
public static List<OpportunityLineItem> getLineItems(
    Id opportunityId,
    Integer pageSize,
    Integer offsetValue,
    String sortField,
    String sortDirection
) {

    Set<String> allowedFields = new Set<String>{
        'Quantity',
        'UnitPrice',
        'TotalPrice'
    };

    if (!allowedFields.contains(sortField)) {
        sortField = 'TotalPrice';
    }

    if (sortDirection != 'ASC' && sortDirection != 'DESC') {
        sortDirection = 'DESC';
    }

    if (pageSize == null || pageSize <= 0) {
        pageSize = 10;
    }

    if (offsetValue == null || offsetValue < 0) {
        offsetValue = 0;
    }

    String query =
        'SELECT Id, OpportunityId, PricebookEntry.Name, ' +
        'Quantity, UnitPrice, TotalPrice ' +
        'FROM OpportunityLineItem ' +
        'WHERE OpportunityId = :opportunityId ' +
        'ORDER BY ' + sortField + ' ' + sortDirection +
        ' LIMIT ' + pageSize +
        ' OFFSET ' + offsetValue;

    System.debug('SOQL Query: ' + query);

    return Database.query(query);
}


@AuraEnabled(cacheable=true)
public static Integer getTotalCount(Id opportunityId) {

    return [
        SELECT COUNT()
        FROM OpportunityLineItem
        WHERE OpportunityId = :opportunityId
    ];
}
}