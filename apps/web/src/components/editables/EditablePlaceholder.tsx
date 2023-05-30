import { useCallback } from "react"
import { Block } from "@/types"
import { Copy, Loader, Upload } from "lucide-react"
import { FileRejection, useDropzone } from "react-dropzone"

import { useToast } from "@guidepilot/ui/lib/useToast"
import { cn } from "@guidepilot/ui/lib/utils"
import { BUCKET, storage } from "@/lib/appwrite"
import { useUploadFileMutation } from "@/lib/hooks/guides.hooks"
import { fileUtils } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface IEditablePlaceholder {
  guideId: string
  block: Block
  onUploadFile: (url: string, id: string) => void
  shouldShowCopyPreviousBlock: boolean
  onCopyPreviousBlockClick: (id: string) => void
}

export const EditablePlaceholder = (props: IEditablePlaceholder) => {
  const { toast } = useToast()
  const { user } = useAuth()

  const { mutate: uploadFileMutation, isLoading: isUploadingFile } =
    useUploadFileMutation({
      onSuccess: (file, blockId) => {
        props.onUploadFile(
          storage.getFileView(BUCKET.IMAGES, file.$id).href +
            "&t=" +
            new Date().getTime(),
          blockId
        )
      },
    })

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      rejectedFiles.forEach((file) => {
        file.errors.forEach((err) => {
          const errorMessage = fileUtils.getFileErrorMessage(err)
          toast({
            variant: "destructive",
            title: errorMessage.title,
            description: errorMessage.description,
          })
        })
      })

      if (acceptedFiles.length) {
        const acceptedFile = acceptedFiles[0]
        const renamedFile = fileUtils.getRenamedFile(
          acceptedFile,
          user?.$id,
          props.guideId,
          props.block.id
        )
        uploadFileMutation({
          guideId: props.guideId,
          blockId: props.block.id,
          file: renamedFile,
        })
      }
    },
    []
  )

  const { getRootProps, getInputProps, isDragReject, isDragAccept } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: fileUtils.acceptFormats,
      maxSize: fileUtils.maxSize,
    })

  return (
    <div className="flex w-full flex-col items-center justify-center text-center">
      {props.shouldShowCopyPreviousBlock && (
        <>
          <button
            onClick={() => props.onCopyPreviousBlockClick(props.block.id)}
            className=" bg-background hover:border-foreground mx-auto flex w-10/12 items-center justify-center rounded-md border p-0.5 shadow-sm"
          >
            <div className="text-muted-foreground flex h-32 flex-col items-center justify-center rounded-sm">
              <Copy className="mb-2 h-8 w-8" />
              Use Previous block&apos;s Content
            </div>
          </button>
          <p className="text-muted-foreground my-6">or</p>
        </>
      )}
      <div
        className={cn(
          "mx-auto w-10/12 rounded-md border border-dashed bg-transparent p-0.5 shadow-sm",
          isDragAccept ? "border-foreground" : "hover:border-foreground",
          isDragReject ? "border-destructive" : ""
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="bg-muted flex h-full w-full flex-col items-center rounded-sm p-5 py-10">
          <div className="text-muted-foreground flex h-32 w-48 flex-col items-center justify-center rounded-sm border">
            {isUploadingFile ? (
              <Loader className="mb-2 h-8 w-8 animate-spin" />
            ) : (
              <Upload className="mb-2 h-8 w-8" />
            )}
            Upload image
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            jpeg/png/webp/avif/gif &lt; 8MB
          </p>
        </div>
      </div>
    </div>
  )
}
