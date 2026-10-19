import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AiAdvisorService } from '../../../core/mock-api/ai-advisor.service';

/** Screen W-02 | Specialist/leader | Read a dossier, draft answer, submit for approval and publish. | UC-27..UC-42 */
@Component({imports:[WorkspaceShellComponent,RouterLink,FormsModule,DatePipe,DecimalPipe,ButtonModule,TextareaModule,DialogModule,StatusBadgeComponent],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl: './dossier-detail.component.html', styleUrl: './dossier-detail.component.scss' })
export class DossierDetailComponent { readonly db=inject(MockDbService); readonly auth=inject(AuthService); readonly ai=inject(AiAdvisorService); private readonly route=inject(ActivatedRoute); private readonly messages=inject(MessageService); readonly collapsed=signal(false); readonly saving=signal(false); readonly id=this.route.snapshot.paramMap.get('id')??''; readonly dossier=computed(()=>this.db.dossiers().find(item=>item.id===this.id)); readonly aiSuggestions=computed(()=>this.ai.suggestions().filter(item=>item.dossierId===this.id)); answer=this.dossier()?.answer??''; topicName(id:string){return this.db.topics.find(t=>t.id===id)?.name??'KhÃƒÂ¡c';} saveDraft(){this.db.updateAnswer(this.id,this.answer,this.dossier()?.legalBasis??[]);this.messages.add({severity:'success',summary:'Ã„ÂÃƒÂ£ lÃ†Â°u dÃ¡Â»Â± thÃ¡ÂºÂ£o',detail:'NÃ¡Â»â„¢i dung dÃ¡Â»Â± thÃ¡ÂºÂ£o Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t.'});} receive(){this.db.updateStatus(this.id,'processing',this.auth.user()?.name??'ChuyÃƒÂªn viÃƒÂªn','NhÃ¡ÂºÂ­n xÃ¡Â»Â­ lÃƒÂ½ hÃ¡Â»â€œ sÃ†Â¡','HÃ¡Â»â€œ sÃ†Â¡ Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c tiÃ¡ÂºÂ¿p nhÃ¡ÂºÂ­n Ã„â€˜Ã¡Â»Æ’ nghiÃƒÂªn cÃ¡Â»Â©u, dÃ¡Â»Â± thÃ¡ÂºÂ£o trÃ¡ÂºÂ£ lÃ¡Â»Âi.');} runAi(){this.ai.suggestFor(this.id,this.dossier()?.question??'');this.messages.add({severity:'info',summary:'Ã„ÂÃƒÂ£ phÃƒÂ¢n tÃƒÂ­ch hÃ¡Â»â€œ sÃ†Â¡',detail:'GÃ¡Â»Â£i ÃƒÂ½ AI chÃ¡Â»â€° mang tÃƒÂ­nh tham khÃ¡ÂºÂ£o vÃƒÂ  cÃ¡ÂºÂ§n cÃƒÂ¡n bÃ¡Â»â„¢ xÃƒÂ¡c nhÃ¡ÂºÂ­n.'});} acceptAi(id:string){this.ai.accept(id);this.messages.add({severity:'success',summary:'Ã„ÂÃƒÂ£ xÃƒÂ¡c nhÃ¡ÂºÂ­n gÃ¡Â»Â£i ÃƒÂ½',detail:'GÃ¡Â»Â£i ÃƒÂ½ Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c ghi nhÃ¡ÂºÂ­n vÃƒÂ o luÃ¡Â»â€œng xÃ¡Â»Â­ lÃƒÂ½.'});} rejectAi(id:string){this.ai.reject(id);} sendForApproval(){this.saveDraft();this.perform('waiting-approval','TrÃƒÂ¬nh phÃƒÂª duyÃ¡Â»â€¡t','DÃ¡Â»Â± thÃ¡ÂºÂ£o Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c gÃ¡Â»Â­i lÃƒÂ£nh Ã„â€˜Ã¡ÂºÂ¡o xem xÃƒÂ©t.','Ã„ÂÃƒÂ£ trÃƒÂ¬nh phÃƒÂª duyÃ¡Â»â€¡t');} approve(){this.perform('published','PhÃƒÂª duyÃ¡Â»â€¡t vÃƒÂ  cÃƒÂ´ng khai','CÃƒÂ¢u trÃ¡ÂºÂ£ lÃ¡Â»Âi Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c phÃƒÂª duyÃ¡Â»â€¡t vÃƒÂ  cÃƒÂ´ng khai trÃƒÂªn cÃ¡Â»â€¢ng thÃƒÂ´ng tin.','Ã„ÂÃƒÂ£ cÃƒÂ´ng khai cÃƒÂ¢u trÃ¡ÂºÂ£ lÃ¡Â»Âi');} private perform(status:any,title:string,description:string,summary:string){this.saving.set(true);setTimeout(()=>{this.db.updateStatus(this.id,status,this.auth.user()?.name??'CÃƒÂ¡n bÃ¡Â»â„¢',title,description);this.saving.set(false);this.messages.add({severity:'success',summary,detail:'TrÃ¡ÂºÂ¡ng thÃƒÂ¡i hÃ¡Â»â€œ sÃ†Â¡ Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t.',life:3500});},480);} }




