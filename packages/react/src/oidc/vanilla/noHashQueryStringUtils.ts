import {BasicQueryStringUtils} from '@openid/appauth';

export class NoHashQueryStringUtils extends BasicQueryStringUtils {
    parse(input, useHash) {
        const output = super.parse(input, false /* never use hash */);
        return output;
    }
}

export class HashQueryStringUtils extends BasicQueryStringUtils {
    parse(input, useHash) {
        const output =  super.parse(input, true /* use hash */);
        
        // Fix AppAuthJs behavior
        let propertyToDelelete = null;
        Object.entries(output).map(([key, value]) => {
            if(key.endsWith("?code")){
                output["code"]= value;
                propertyToDelelete = key;
            }
        });
        
        if(propertyToDelelete){
            delete output[propertyToDelelete];
        }
        
        return output;
    }
}
