export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">로그인 오류</h1>
        <p className="text-gray-600 mb-4">인증 과정에서 문제가 발생했습니다.</p>
        <a href="/login" className="text-blue-500 underline">
          다시 로그인하기
        </a>
      </div>
    </div>
  )
}
