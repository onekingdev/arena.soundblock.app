import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, patch: jasmine.Spy };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: []
    });
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
    service = new AuthService(httpClientSpy as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected user info (HttpClient called once)', () => {
    const authInfo = {
      data: {
        auth: {
          token_type: 'Bearer',
          expires_in: 86400,
          access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiNjUwNmVjNmY4MTZmZDI0NmIzYWJkYmRiMjUzNDExM2ZlYWIxZDkwMTc4YzI1ODg4OTkzNTY0NDhmZTlhM2MyMTZhNDBmNzMzOWVkZTAwM2UiLCJpYXQiOjE1ODMyNTI1MjgsIm5iZiI6MTU4MzI1MjUyOCwiZXhwIjoxNTgzMzM4OTI4LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.zkg-_azoTnK0z9rs04KWbTpp0A4q3QjI91mgmTuwUVcw-PHc4hLxkJjZrcxN_xqJAD2DEmoMziAD6rjkyPCAGEFUHTuBbY29Ufopfok7X_03cL3PGDMHxeU0J_DAxabDCKFHgjCKMfZBzpcFnyRkKAm_0BmxtOEq9MUDKP-FdS3IEZGsJJcoUBhFpQCbSuADALZEngoGfCl8dFZPcWgy9y_xrV_kadX26s5BuIsgUmsMY4pKPYYwwWGgr1J71N6L5ouiTu-ohZhJXrsTRg-o5hqYBgxSHz__s1qmr93f7v531EkhAc6vBGLlrLocD2L1WnEuir0gDqK2VdO1_UfTB07gfQL5G-oAypiW8lRnBzWO-c5ivqyWaTjlcwgsbMTxMTwXEdSB58BcVQ4fvEyFPttm8NtHxSOjCSTCHfUDhyD0RoVI49WuNEPR1oZf70C4JklyUsvOdTraTs4ADzec9nGj5RXhoMO4RE3z8a1h184xfon6Wyu_kJEXrCTJDZu0SEYHeyVnUk_dM4QQkgilR2ykCQXDOxt1Wqg-mfPRdChD4N7RtSPj1gjQ5HJvdSefeO-mmSewqgKJ0FDqL90sZ2eoAG0MmhA6qYTV37x1LVnm615NsEUmdCd-p9q1CuXRU1HBtgsKbpUb6J4smeRdoW6t76sb7HOKYlISx7xQaCo',
          refresh_token: 'def50200c921033a8e2fee78d48d697eb26088a40cfe2bad9964053f2efa7840fb9af978e2e618c4f0bcf4048db0126f2b0af0b23f099a2f863930ddc48dccf34f41d69975aed4ed34dbba29b5bdf31136002c7333700131238f36746cb9dfcd079ecd2fa35946ac6c01405cb3e0f89649f770e654f6e4bcd2d4678c630c965caa1196ffe400e20f0267d7ecb051ccda2a497df7b7dd24f81548752ca0f85d7165d9c99822767e69e6c35e2beabce829aaf23eff585d46635b472dba707dd6d08157c4369b09d61576602befe8eae08902d74f48e730532a37242e553f3bde1bfaf1d692f51bb4d0a20a2f99da39c22e2bdce077a169a5466c03f725a0678f0be1cb1133dec0d93e29714097aafbadf1236b7b8613684a2d778faeca296000bbabe19b3ca50d7ac1519799465089e19b17427e79d196670f7a92b57c2ae772197dbc96f935f594a45d5f641c8a69b2f525b3e78ff4e987d72e1a05aa41ea4a7971'
        },
        user: 'D4A293C4-4CBE-4DE5-B493-FBC22C0D9B89'
      },
    };
    httpClientSpy.post.and.returnValue(of(authInfo));

    service.signIn('user', 'password').subscribe(user => expect(user).toEqual(authInfo.data), fail);
    expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
  });

  it('should return expected tokens (HttpClient called once)', () => {
    const tokens = {
      data: {
        access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiNjUwNmVjNmY4MTZmZDI0NmIzYWJkYmRiMjUzNDExM2ZlYWIxZDkwMTc4YzI1ODg4OTkzNTY0NDhmZTlhM2MyMTZhNDBmNzMzOWVkZTAwM2UiLCJpYXQiOjE1ODMyNTI1MjgsIm5iZiI6MTU4MzI1MjUyOCwiZXhwIjoxNTgzMzM4OTI4LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.zkg-_azoTnK0z9rs04KWbTpp0A4q3QjI91mgmTuwUVcw-PHc4hLxkJjZrcxN_xqJAD2DEmoMziAD6rjkyPCAGEFUHTuBbY29Ufopfok7X_03cL3PGDMHxeU0J_DAxabDCKFHgjCKMfZBzpcFnyRkKAm_0BmxtOEq9MUDKP-FdS3IEZGsJJcoUBhFpQCbSuADALZEngoGfCl8dFZPcWgy9y_xrV_kadX26s5BuIsgUmsMY4pKPYYwwWGgr1J71N6L5ouiTu-ohZhJXrsTRg-o5hqYBgxSHz__s1qmr93f7v531EkhAc6vBGLlrLocD2L1WnEuir0gDqK2VdO1_UfTB07gfQL5G-oAypiW8lRnBzWO-c5ivqyWaTjlcwgsbMTxMTwXEdSB58BcVQ4fvEyFPttm8NtHxSOjCSTCHfUDhyD0RoVI49WuNEPR1oZf70C4JklyUsvOdTraTs4ADzec9nGj5RXhoMO4RE3z8a1h184xfon6Wyu_kJEXrCTJDZu0SEYHeyVnUk_dM4QQkgilR2ykCQXDOxt1Wqg-mfPRdChD4N7RtSPj1gjQ5HJvdSefeO-mmSewqgKJ0FDqL90sZ2eoAG0MmhA6qYTV37x1LVnm615NsEUmdCd-p9q1CuXRU1HBtgsKbpUb6J4smeRdoW6t76sb7HOKYlISx7xQaCo',
        refresh_token: 'def50200c921033a8e2fee78d48d697eb26088a40cfe2bad9964053f2efa7840fb9af978e2e618c4f0bcf4048db0126f2b0af0b23f099a2f863930ddc48dccf34f41d69975aed4ed34dbba29b5bdf31136002c7333700131238f36746cb9dfcd079ecd2fa35946ac6c01405cb3e0f89649f770e654f6e4bcd2d4678c630c965caa1196ffe400e20f0267d7ecb051ccda2a497df7b7dd24f81548752ca0f85d7165d9c99822767e69e6c35e2beabce829aaf23eff585d46635b472dba707dd6d08157c4369b09d61576602befe8eae08902d74f48e730532a37242e553f3bde1bfaf1d692f51bb4d0a20a2f99da39c22e2bdce077a169a5466c03f725a0678f0be1cb1133dec0d93e29714097aafbadf1236b7b8613684a2d778faeca296000bbabe19b3ca50d7ac1519799465089e19b17427e79d196670f7a92b57c2ae772197dbc96f935f594a45d5f641c8a69b2f525b3e78ff4e987d72e1a05aa41ea4a7971'
      },
    };
    httpClientSpy.patch.and.returnValue(of(tokens));

    service.refreshToken().subscribe(user => expect(user).toEqual(tokens.data), fail);
    expect(httpClientSpy.patch.calls.count()).toBe(1, 'one call');
  });
});
