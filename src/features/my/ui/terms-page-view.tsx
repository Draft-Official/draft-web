'use client';

import {
  LegalPageLayout,
  SectionTitle,
  SubTitle,
  Paragraph,
  OrderedList,
  UnorderedList,
  Table,
  EffectiveDate,
} from './legal-page-layout';

export function TermsPageView() {
  return (
    <LegalPageLayout title="서비스 이용약관">
      <Paragraph>시행일자: 2026년 2월 12일</Paragraph>

      <SectionTitle>제1조 (목적)</SectionTitle>
      <Paragraph>
        이 약관은 DRAFT(이하 &quot;회사&quot;)가 제공하는 농구 용병 모집 플랫폼 서비스(이하
        &quot;서비스&quot;)의 이용조건 및 절차, 회사와 회원 간의 권리·의무·책임사항을 규정함을
        목적으로 합니다.
      </Paragraph>

      <SectionTitle>제2조 (정의)</SectionTitle>
      <Paragraph>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</Paragraph>
      <OrderedList>
        <li><strong>서비스</strong>: 회사가 제공하는 농구 용병 모집 및 매칭 플랫폼</li>
        <li><strong>회원</strong>: 이 약관에 동의하고 회원가입을 완료하여 서비스를 이용하는 자</li>
        <li><strong>게스트(Guest)</strong>: 매치에 용병으로 참가 신청하는 회원</li>
        <li><strong>호스트(Host)</strong>: 매치를 생성하고 용병을 모집하는 회원</li>
        <li><strong>매치</strong>: 호스트가 생성한 농구 경기 일정</li>
        <li><strong>참가비</strong>: 게스트가 매치에 참가하기 위해 지불하는 비용</li>
        <li><strong>신청</strong>: 게스트가 매치 참가를 요청하는 행위</li>
        <li><strong>확정</strong>: 호스트가 게스트의 신청을 승인하여 참가가 확정되는 것</li>
        <li><strong>팀</strong>: 서비스 내에서 등록된 농구 팀</li>
      </OrderedList>

      <SectionTitle>제3조 (약관의 명시와 개정)</SectionTitle>
      <OrderedList>
        <li>회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 내 화면에 게시합니다.</li>
        <li>회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
        <li>
          약관을 개정할 경우 적용일 7일 전부터 서비스 내 공지합니다. 다만, 회원에게 불리한
          변경인 경우 적용일 30일 전부터 공지합니다.
        </li>
        <li>
          회원이 개정 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
          개정 약관의 적용일 이후에도 서비스를 계속 이용하는 경우 약관 변경에 동의한 것으로
          봅니다.
        </li>
      </OrderedList>

      <SectionTitle>제4조 (서비스의 제공)</SectionTitle>
      <Paragraph>회사는 다음의 서비스를 제공합니다.</Paragraph>
      <OrderedList>
        <li>농구 매치 생성 및 용병 모집 서비스</li>
        <li>매치 검색 및 참가 신청 서비스</li>
        <li>팀 생성 및 관리 서비스</li>
        <li>일정 관리 서비스</li>
        <li>참가비 결제 및 정산 서비스</li>
        <li>매치 관련 알림 서비스</li>
        <li>기타 회사가 추가로 개발하거나 제휴를 통해 제공하는 서비스</li>
      </OrderedList>

      <SectionTitle>제5조 (서비스의 변경 및 중단)</SectionTitle>
      <OrderedList>
        <li>
          회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있으며, 변경
          시 사전에 공지합니다.
        </li>
        <li>
          다음 각 호의 경우 서비스 제공을 일시적으로 중단할 수 있습니다.
          <UnorderedList>
            <li>시스템 점검, 교체 또는 고장</li>
            <li>천재지변, 정전, 통신장애 등 불가항력적 사유</li>
            <li>기타 회사의 합리적 판단에 따른 불가피한 사유</li>
          </UnorderedList>
        </li>
        <li>
          서비스 중단 시 사전 공지를 원칙으로 하되, 긴급한 경우 사후에 공지할 수 있습니다.
        </li>
      </OrderedList>

      <SectionTitle>제6조 (회원가입)</SectionTitle>
      <OrderedList>
        <li>
          회원가입은 서비스에서 제공하는 방식(카카오 로그인, 구글 로그인, 이메일 가입)을 통해
          이루어집니다.
        </li>
        <li>회원가입 시 실명과 전화번호 인증을 완료해야 합니다.</li>
        <li>
          회사는 다음 각 호에 해당하는 경우 가입을 거절하거나 사후에 이용을 제한할 수
          있습니다.
          <UnorderedList>
            <li>타인의 명의를 도용한 경우</li>
            <li>허위 정보를 기재한 경우</li>
            <li>만 14세 미만인 경우</li>
            <li>이전에 이 약관 위반으로 자격이 상실된 적이 있는 경우</li>
          </UnorderedList>
        </li>
      </OrderedList>

      <SectionTitle>제7조 (회원 탈퇴 및 자격 상실)</SectionTitle>
      <OrderedList>
        <li>회원은 언제든지 서비스 내 설정을 통해 탈퇴를 신청할 수 있습니다.</li>
        <li>
          탈퇴 시 개인정보는 익명화 처리되며, 과거 매치 기록은 &quot;탈퇴한 사용자&quot;로
          표시되어 보존됩니다.
        </li>
        <li>확정된 매치가 있는 경우 해당 매치의 정산이 완료된 후 탈퇴가 처리됩니다.</li>
        <li>팀 리더인 회원이 탈퇴하는 경우 다른 팀원에게 리더 권한이 자동 이전됩니다.</li>
        <li>
          회사는 다음 각 호에 해당하는 경우 회원 자격을 제한 또는 상실시킬 수 있습니다.
          <UnorderedList>
            <li>가입 시 허위 정보를 기재한 경우</li>
            <li>타인의 서비스 이용을 방해하거나 정보를 도용한 경우</li>
            <li>서비스를 이용하여 법령 또는 이 약관이 금지하는 행위를 한 경우</li>
            <li>허위 입금 표시 등 결제 관련 부정행위를 한 경우</li>
          </UnorderedList>
        </li>
      </OrderedList>

      <SectionTitle>제8조 (회원에 대한 통지)</SectionTitle>
      <OrderedList>
        <li>
          회사가 회원에게 통지하는 경우 서비스 내 알림, 문자메시지(SMS), 이메일 등의 방법을
          사용할 수 있습니다.
        </li>
        <li>
          불특정 다수 회원에 대한 통지는 서비스 내 공지사항 게시로 개별 통지를 갈음할 수
          있습니다.
        </li>
      </OrderedList>

      <SectionTitle>제9조 (매치 생성 및 참가)</SectionTitle>

      <SubTitle>호스트의 의무</SubTitle>
      <OrderedList>
        <li>
          호스트는 매치 생성 시 정확한 정보(장소, 일시, 인원, 참가비, 경기 형식 등)를
          기재해야 합니다.
        </li>
        <li>허위 또는 과장된 매치 정보를 게시해서는 안 됩니다.</li>
        <li>참가가 확정된 게스트에게 경기 장소, 시간 등 필요한 정보를 안내해야 합니다.</li>
        <li>매치 운영에 대한 책임은 호스트에게 있습니다.</li>
      </OrderedList>

      <SubTitle>게스트의 의무</SubTitle>
      <OrderedList>
        <li>
          게스트는 프로필에 정확한 신체 정보(키, 몸무게 등)와 실력 수준을 기재해야 합니다.
        </li>
        <li>참가가 확정된 매치에 무단으로 불참해서는 안 됩니다.</li>
        <li>참가비를 정해진 기한 내에 지불해야 합니다.</li>
      </OrderedList>

      <SubTitle>플랫폼의 역할</SubTitle>
      <Paragraph>
        회사는 호스트와 게스트 간 매칭을 위한 플랫폼을 제공하는 중개자로서, 매치 운영 자체의
        당사자는 아닙니다. 매치의 진행, 품질 및 안전에 대한 1차적 책임은 호스트에게 있습니다.
      </Paragraph>

      <SectionTitle>제10조 (결제)</SectionTitle>
      <OrderedList>
        <li>
          참가비는 호스트가 매치 생성 시 설정하며, 게스트는 서비스에서 제공하는 결제 수단을
          통해 지불합니다.
        </li>
        <li>
          허위 입금 표시 등 결제 관련 부정행위는 엄격히 금지되며, 적발 시 서비스 이용이
          제한됩니다.
        </li>
        <li>결제와 관련한 상세 사항은 서비스 내 안내를 따릅니다.</li>
      </OrderedList>

      <SectionTitle>제11조 (취소 및 환불)</SectionTitle>

      <SubTitle>게스트의 취소</SubTitle>
      <Table
        headers={['취소 시점', '환불 비율']}
        rows={[
          ['매치 시작 48시간 전까지', '참가비의 100%'],
          ['매치 시작 24시간 전까지', '참가비의 80%'],
          ['매치 시작 2시간 전까지', '참가비의 50%'],
          ['매치 시작 2시간 이내', '환불 불가'],
        ]}
      />

      <SubTitle>호스트 또는 기타 사유에 의한 취소</SubTitle>
      <OrderedList>
        <li>호스트의 귀책 사유로 매치가 취소된 경우 참가비의 100%를 환불합니다.</li>
        <li>인원 미달로 매치가 취소된 경우 참가비의 100%를 환불합니다.</li>
        <li>우천, 폭설 등 천재지변으로 매치가 취소된 경우 참가비의 100%를 환불합니다.</li>
      </OrderedList>

      <SubTitle>환불 처리</SubTitle>
      <Paragraph>환불은 원래 결제 수단으로 3영업일 이내에 처리됩니다.</Paragraph>

      <SectionTitle>제12조 (회원의 의무)</SectionTitle>
      <OrderedList>
        <li>
          회원은 다음 각 호의 행위를 해서는 안 됩니다.
          <UnorderedList>
            <li>가입 또는 정보 변경 시 허위 내용을 등록하는 행위</li>
            <li>타인의 정보를 도용하는 행위</li>
            <li>회사가 게시한 정보를 임의로 변경하는 행위</li>
            <li>서비스를 이용하여 법령 또는 공서양속에 반하는 행위</li>
            <li>회사 및 타인의 명예를 훼손하거나 업무를 방해하는 행위</li>
            <li>서비스의 안정적 운영을 방해하는 행위</li>
          </UnorderedList>
        </li>
        <li>
          회원은 매치 참가 시 다음 각 호를 준수해야 합니다.
          <UnorderedList>
            <li>스포츠맨십에 입각한 공정한 플레이</li>
            <li>폭력, 폭언, 비매너 행위 금지</li>
            <li>음주 상태에서의 경기 참가 금지</li>
            <li>경기장 시설 및 장비의 올바른 이용</li>
          </UnorderedList>
        </li>
        <li>
          위 의무를 위반한 회원에 대해 회사는 서비스 이용 제한, 계정 정지 등의 조치를 취할 수
          있습니다.
        </li>
      </OrderedList>

      <SectionTitle>제13조 (회사의 의무)</SectionTitle>
      <OrderedList>
        <li>
          회사는 관련 법령과 이 약관이 정하는 권리의 행사 및 의무의 이행을 신의에 좇아 성실히
          합니다.
        </li>
        <li>회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</li>
        <li>
          회사는 회원의 개인정보를 보호하기 위해 개인정보 처리방침을 수립하고 이를 준수합니다.
        </li>
        <li>
          회사는 서비스 이용과 관련한 회원의 불만사항을 접수하고 적절한 조치를 취합니다.
        </li>
      </OrderedList>

      <SectionTitle>제14조 (스포츠 활동에 대한 안전 및 책임)</SectionTitle>
      <OrderedList>
        <li>
          농구는 신체 접촉이 수반되는 스포츠로, 경기 참가 시 부상의 위험이 존재합니다. 회원은
          이를 충분히 인지하고 본인의 판단과 책임 하에 경기에 참가합니다.
        </li>
        <li>
          경기 중 발생한 부상에 대하여 회사는 원칙적으로 책임을 지지 않습니다. 다만, 회사의
          고의 또는 중대한 과실이 있는 경우는 예외로 합니다.
        </li>
        <li>
          회원은 경기 참가 전 본인의 건강 상태를 확인하고, 필요 시 개인 보험에 가입할 것을
          권장합니다.
        </li>
      </OrderedList>

      <SectionTitle>제15조 (손해배상)</SectionTitle>
      <OrderedList>
        <li>
          회사 또는 회원이 이 약관을 위반하여 상대방에게 손해를 입힌 경우 그 손해를 배상할
          책임이 있습니다.
        </li>
        <li>
          회사는 무료로 제공하는 서비스의 이용과 관련하여 회원에게 발생한 손해에 대해서는
          책임을 지지 않습니다. 다만, 회사의 고의 또는 중대한 과실로 인한 경우는 예외로 합니다.
        </li>
      </OrderedList>

      <SectionTitle>제16조 (면책)</SectionTitle>
      <OrderedList>
        <li>
          회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 서비스를
          제공할 수 없는 경우 책임이 면제됩니다.
        </li>
        <li>
          회사는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 개입할
          의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.
        </li>
        <li>
          회사는 회원이 서비스에 게재한 정보, 자료의 정확성 및 신뢰성에 대해 책임을 지지
          않습니다.
        </li>
      </OrderedList>

      <SectionTitle>제17조 (분쟁 해결)</SectionTitle>
      <OrderedList>
        <li>
          회사와 회원 간 발생한 분쟁에 관하여 회원의 불만사항이 있는 경우 회사에 구제를 신청할
          수 있습니다.
        </li>
        <li>
          회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.
        </li>
      </OrderedList>

      <EffectiveDate date="2026년 2월 12일" />
    </LegalPageLayout>
  );
}
