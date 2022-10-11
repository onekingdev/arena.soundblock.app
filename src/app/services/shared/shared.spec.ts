import { TestBed, getTestBed } from '@angular/core/testing';
import { SharedService } from './shared';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Project } from 'src/app/models/project';

describe('SharedService', () => {
  let service: SharedService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: []
    });
    service = TestBed.get(SharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return strong for password with symbols, numbers and uppercase characters : checkPasswordStrength', () => {
    const data = '!@#aSADFd0351';
    expect(service.checkPasswordStrength(data)).toEqual('Strong');
  });

  it('should return medium for password with numbers and uppercase characters : checkPasswordStrength', () => {
    const data = 'ASDFsadf234';
    expect(service.checkPasswordStrength(data)).toEqual('Medium');
  });

  it('should return correct icon class for file : getFileIcon', () => {
    const caseData = ['dir', 'mp3', 'doc', 'docx', 'ai', 'psd', 'png', 'mp4', 'pdf'];
    const expectData = ['fa-folder', 'fa-file-audio', 'fa-file-word', 'fa-file-word', 'fa-file-image',
    'fa-file-image', 'fa-file-image', 'fa-file-video', 'fa-file-pdf'];
    for (let i = 0; i < caseData.length; i ++) {
      expect(service.getFileIcon(caseData[i])).toEqual(expectData[i]);
    }
  });

  it('should return only file name without extension : getFileName', () => {
    expect(service.getFileName('file.txt')).toEqual('file');
  });

  it('should return only file extensione without name : getFileKind', () => {
    expect(service.getFileKind('file.txt')).toEqual('txt');
  });
});
