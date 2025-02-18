import { Spinner } from "@kwitch/ui/components/spinner"

export default function Loading() {
  return (
    <div className='flex flex-1 justify-center items-center'>
      <Spinner size={"medium"} />
      Please wait...
    </div>
  )
}
