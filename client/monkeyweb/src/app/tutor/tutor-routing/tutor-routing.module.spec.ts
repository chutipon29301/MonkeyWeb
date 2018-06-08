import { TutorRoutingModule } from './tutor-routing.module';

describe('TutorRoutingModule', () => {
  let tutorRoutingModule: TutorRoutingModule;

  beforeEach(() => {
    tutorRoutingModule = new TutorRoutingModule();
  });

  it('should create an instance', () => {
    expect(tutorRoutingModule).toBeTruthy();
  });
});
