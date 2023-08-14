import {
    ChatIcon,
    ShareIcon,
    TrashIcon,
    SwitchHorizontalIcon,
    HeartIcon as HeartOutlineIcon,
} from "@heroicons/react/outline"
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/solid"

interface ActionsProps {
    id: string
    session: any
    comments: Array<any>
    onClickComment: Function
    deletePost: Function
    sharePost: Function
    likePost: Function
    likes: Array<any>
    liked: boolean
    postPage: any
}

const PostActions = (props: ActionsProps) => {
    // Props
    const {
        id,
        session,
        comments,
        onClickComment,
        deletePost,
        sharePost,
        likePost,
        likes,
        liked,
        postPage,
    } = props

    // Render
    return (
        <div className="flex items-center justify-between w-full sm:w-8/12 text-gray-400 mx-auto">

            <div
                onClick={e => onClickComment(e)}
                className="flex items-center space-x-1 group"
            >
                <div className="group iconButton">
                    <ChatIcon className="icon group-hover:text-blue-400" />
                </div>
                {(comments.length > 0 && !postPage) && (
                    <small className="group-hover:text-blue-400">
                        {comments.length}
                    </small>
                )}
            </div>

            <div
                onClick={e => e.stopPropagation()}
                className="flex items-center group"
            >
                {
                    session.user.uid == id
                        ? (
                            <div
                                onClick={e => deletePost(e)}
                                className="group iconButton"
                            >
                                <TrashIcon className="icon text-red-500 group-hover:text-red-600" />
                            </div>
                        )
                        : (
                            <div className="group iconButton">
                                <SwitchHorizontalIcon className="icon" />
                            </div>
                        )
                }
            </div>

            <div className="flex items-center space-x-1 group">
                {
                    liked
                        ? (
                            <div onClick={e => likePost(e)} className="group iconButton text-pink-600">
                                <HeartSolidIcon className="icon group-hover:text-pink-600" />
                            </div>
                        )
                        : (
                            <div onClick={e => likePost(e)} className="group iconButton">
                                <HeartOutlineIcon className="icon group-hover:text-pink-600" />
                            </div>
                        )
                }
                {(likes.length > 0 && !postPage) && (
                    <p className={`text-sm cursor-pointer hover:underline group-hover:text-pink-600 ${liked && "text-pink-600"}`}>
                        {likes.length}
                    </p>
                )}
            </div>

            <div
                onClick={e => sharePost(e)}
                className="group iconButton"
            >
                <ShareIcon className="icon" />
            </div>

        </div>
    );
}

export default PostActions;