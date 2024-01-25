import { beforeEach, describe, expect, it } from 'vitest';

import { OidcServerConfiguration } from '../../types';
import {_hideTokens, extractTokenPayload, isTokensOidcValid, isTokensValid, parseJwt} from '..';
import { OidcConfigBuilder, OidcServerConfigBuilder, TokenBuilder } from './testHelper';

describe('tokens', () => {
  let oidcServerConfig: OidcServerConfiguration;

  beforeEach(() => {
    oidcServerConfig = new OidcServerConfigBuilder()
      .withTestingDefault()
      .build();
  });

  describe('isTokensValid', () => {
    it('can check expired token', () => {
      expect(
        isTokensValid(new TokenBuilder().withExpiredToken().build()),
      ).toBeFalsy();
    });

    it('can check non-expired token', () => {
      const token = new TokenBuilder().withNonExpiredToken().build();
      expect(isTokensValid(token)).toBeTruthy();
    });

    it('can check null token', () => {
      expect(isTokensValid(null)).toBeFalsy();
    });
  });

  describe('extractTokenPayload', () => {

    it('parseJwtShouldExtractData', async () => {
      const claimsPart = "eyJzZXNzaW9uX3N0YXRlIjoiNzVjYzVlZDItZGYyZC00NTY5LWJmYzUtMThhOThlNjhiZTExIiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoixrTHosOBw6zDhyDlsI_lkI0t44Ob44Or44OYIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdGluZ2NoYXJhY3RlcnNAaW52ZW50ZWRtYWlsLmNvbSIsImdpdmVuX25hbWUiOiLGtMeiw4HDrMOHIiwiZmFtaWx5X25hbWUiOiLlsI_lkI0t44Ob44Or44OYIn0"
      const result = parseJwt(claimsPart);
      expect(result!=null).toBe(true);
    });
    
    it('can extract token payload', () => {
      const result = extractTokenPayload(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      );
      expect(result).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022,
      });
    });
    it('returns null if undefined', () => {
      expect(extractTokenPayload(undefined)).toBeNull();
    });

    it('returns null if invalid token', () => {
      expect(extractTokenPayload('invalid token')).toBeNull();
    });
  });

  describe('isTokensOidcValid', () => {
    it('can validate valid token', () => {
      const token = new TokenBuilder()
        .withNonExpiredToken()
        .withIdTokenPayload({
          iss: oidcServerConfig.issuer,
          exp: 0,
          iat: 0,
          nonce: null,
        })
        .build();
      const result = isTokensOidcValid(token, null, oidcServerConfig);
      expect(result.isValid).toBeTruthy();
      expect(result.reason).toBe('');
    });
  });

  describe('_hideTokens', () => {
    it.each([
      { hideAccessToken: true, expectedAccessToken: 'ACCESS_TOKEN_SECURED_BY_OIDC_SERVICE_WORKER_test', issued_at: "0", expires_in: "2" },
      { hideAccessToken: false, expectedAccessToken: 'test_access_token', issued_at: 0, expires_in: 2  },
    ])('accesstoken will be hide $hideAccessToken result should be $expectedAccessToken', ({ hideAccessToken, expectedAccessToken, issued_at, expires_in }) => {
      const token = new TokenBuilder()
          .withIdTokenPayload({
            iss: oidcServerConfig.issuer,
            exp: 0,
            iat: 0,
            nonce: null,
          })
          .withNonExpiredToken()
          .withAccessToken('test_access_token')
          .withExpiresIn(expires_in)
          .withIssuedAt(issued_at)
          .build();
      const oidcConfiguration = new OidcConfigBuilder().withTestingDefault().withHideAccessToken(hideAccessToken).build();
      const secureTokens = _hideTokens(token, oidcConfiguration, 'test');
      expect(secureTokens.access_token).toBe(expectedAccessToken);
      expect(typeof secureTokens.expiresAt).toBe("number");
    });
  });
});
