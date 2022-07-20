import React, {useEffect, ComponentType} from 'react';
import Oidc from "../../vanilla/oidc";

const CallbackManager: ComponentType<any> = ({configurationName }) => {

    useEffect(() => {
        let isMounted = true;
        const playCallbackAsync = async () => {
            const getOidc =  Oidc.get;
            const oidc = getOidc(configurationName);
            try {
                await oidc.loginCallbackAsync(true);
                oidc.silentLoginCallbackFromIFrame();
            } catch (error) {
                oidc.silentLoginErrorCallbackFromIFrame();
            }
        };
        playCallbackAsync();
        return () => {
            isMounted = false;
        };
    },[]);

    return <></>;
};

export default CallbackManager;