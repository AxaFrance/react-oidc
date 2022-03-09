import React, { useEffect, useState, PropsWithChildren} from 'react';
import AuthenticatingError from "./AuthenticateError.component";
import Oidc from "../../vanilla/oidc";
import Authenticating from "./Authenticating.component";

const ServiceWorkerInstall: PropsWithChildren<any> = ({callBackError, callBackSuccess, configurationName }) => {
    const getOidc =  Oidc.get;
    const [error, setError] = useState(false);
    const [isLoading, setLoading] = useState(true);

    const CallbackErrorComponent = callBackError || AuthenticatingError;
    const CallbackSuccessComponent = callBackSuccess || Authenticating;

    useEffect(() => {
        let isMounted = true;
        const playCallbackAsync = async () => {
            try {
                const params = new Proxy(new URLSearchParams(window.location.search), {
                    // @ts-ignore
                    get: (searchParams, prop) => searchParams.get(prop),
                });
                // @ts-ignore
                await getOidc(configurationName).loginAsync(decodeURIComponent(params.callbackPath), false);
                setLoading(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            }
        };
        playCallbackAsync();
        return  () => {
            isMounted = false;
        };
    },[]);

    if(isLoading){
        return null;
    }

    if(error){
        return <CallbackErrorComponent />
    }

    return <CallbackSuccessComponent />;
};

export default ServiceWorkerInstall;
