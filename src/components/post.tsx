import React from 'react';
import Link from 'next/link'
import Image from "next/image"
import Moment from "react-moment"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { DotsHorizontalIcon } from "@heroicons/react/outline"
import { useRecoilState } from "recoil"
import { modalState, postIdState } from "../atoms/modalAtom"
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import PostActions from "./postActions"
import SharePost from "./sharePost"
import Modal from '../components/modal'

const textWithLinks = (txt: string) => {
    const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    const words = txt.split(" ")
    return words.map((word, idx) => URL_REGEX.test(word)
        ? (
            <React.Fragment key={idx}>
                <a
                    href={word}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-blue-600 hover:underline"
                    style={{
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        hyphens: 'auto',
                    }}
                >
                    {word}
                </a>{' '}
            </React.Fragment>
        )
        : word + " "
    );
}

interface PostProps {
    id: string
    postPage: any
    post: {
        id: string,
        username: string,
        userImg: string,
        image: string,
        text: string,
        tag: string,
        timestamp: any,
    }
}

const Post = ({ id, post, postPage }: PostProps) => {
    // Hooks
    const router = useRouter()
    const { data: session }: any = useSession()
    const [isOpen, setIsOpen] = useRecoilState(modalState)
    const [postId, setPostId] = useRecoilState(postIdState)
    const [comments, setComments] = useState<Array<any>>([])
    const [likes, setLikes] = useState<Array<any>>([])
    const [liked, setLiked] = useState<boolean>(false)
    const [share, setShare] = useState<boolean>(false)
    const [copied, setCopied] = useState<boolean>(false)

    // Function
    const onClickComment = (e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        setPostId(id)
        setIsOpen("comment")
    }

    const deletePost = (e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        const isDelete = confirm("Delete This Post ?").valueOf()
        if (isDelete) {
            deleteDoc(doc(db, "posts", id))
            router.push("/")
        }
    }

    const likePost = async (e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        if (liked) {
            await deleteDoc(doc(db, "posts", id, "likes", session.user.uid))
        } else {
            await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
                tag: session.user.tag,
                username: session.user.name,
                userImg: session.user.image,
            })
        }
    }

    const sharePost = (e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        setShare(prev => !prev)
        setCopied(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`https://twidd.vercel.app/post/${id}`)
        setCopied(true)
    }

    // Lifecycle
    useEffect(() => {
        return onSnapshot(
            query(
                collection(db, "posts", id, "comments"),
                orderBy("timestamp", "desc")
            ),
            (snapshot) => setComments(snapshot.docs)
        )
    }, [db, id])

    useEffect(() => {
        return onSnapshot(collection(db, "posts", id, "likes"), (snapshot => setLikes(snapshot.docs.map(item => {
            return {
                id: item.id,
                ...item.data(),
            }
        }))))
    }, [db, id])

    useEffect(() => {
        return setLiked(likes.findIndex(like => like.id == session?.user?.uid) !== -1)
    }, [likes])

    // Render
    return (
        <div
            onClick={() => !postPage && router.push(`/post/${id}`)}
            className={`${postPage ? "p-5" : "cursor-pointer p-4"} flex border-b border-gray-700 hover:bg-neutral-800`}
        >

            {!postPage && post?.userImg && (
                <div className="min-w-fit">
                    <Link
                        passHref={true}
                        href={"/profile/" + post?.id}
                        onClick={e => e.stopPropagation()}
                    >
                        <Image
                            className="rounded-full"
                            src={post?.userImg}
                            height={44}
                            width={44}
                            alt=""
                        />
                    </Link>
                </div>
            )}

            <div className="flex flex-col space-y-3 w-full relative">

                <div className={`flex mb-2 ${!postPage && "justify-between"}`}>

                    {postPage && post?.userImg && (
                        <div className="w-fit">
                            <Link
                                passHref={true}
                                href={"/profile/" + post?.id}
                                onClick={e => e.stopPropagation()}
                            >
                                <Image
                                    className="rounded-full"
                                    src={post?.userImg}
                                    height={44}
                                    width={44}
                                    alt=""
                                />
                            </Link>
                        </div>
                    )}

                    <div className="text-zinc-300 w-full ml-2">
                        <div className="w-full flex items-center justify-between">
                            <div className="inline-block group">
                                <Link
                                    passHref={true}
                                    href={"/profile/" + post?.id}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <p className={`text-[14px] lg:text-sm font-semibold group-hover:underline ${!postPage && "inline-block"}`}>
                                        {post?.username}
                                    </p>
                                </Link>
                                <small className={`text-gray-400 text-xs ${!postPage && "ml-1"}`}>
                                    @{post?.tag}
                                </small>
                                <span className="text-gray-300 mx-1">·</span>
                                <small className="text-gray-400 hover:underline">
                                    <Moment fromNow>
                                        {post?.timestamp?.toDate()}
                                    </Moment>
                                </small>
                            </div>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="group hidden sm:inline text-gray-300 flex-shrink-0 ml-auto"
                            >
                                <DotsHorizontalIcon className="h-5 group-hover:text-[#1D9BF0]" />
                            </div>
                        </div>

                        {!postPage && (
                            <div className="mt-2 w-auto">
                                <p className="text-sm md:text-base w-auto">
                                    {post && textWithLinks(post?.text)}
                                </p>
                                {post?.image && (
                                    <Image
                                        className={`rounded-lg object-cover mt-2 w-full ${postPage ? "h-fit" : "max-h-96"}`}
                                        src={post.image}
                                        height={720}
                                        width={400}
                                        alt=""
                                    />
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {postPage && (
                    <div className="text-zinc-300">
                        <p className="text-sm md:text-base w-auto mb-2">
                            {post && textWithLinks(post?.text)}
                        </p>
                        {post?.image && (
                            <Image
                                className={`rounded-lg object-contain w-full max-h-screen`}
                                src={post.image}
                                height={720}
                                width={400}
                                alt=""
                            />
                        )}
                    </div>
                )}

                {postPage && (
                    <div className="flex items-center border-y border-gray-700 text-sm py-2">
                        <Moment
                            date={post?.timestamp.toDate()}
                            className="text-gray-500"
                            format="MMM DD, YYYY"
                        />
                        <span className="text-gray-300 mx-2">·</span>
                        <p className="text-zinc-300">
                            <b>{comments.length}</b> Comments
                        </p>
                        <span className="text-gray-300 mx-2">·</span>
                        <p
                            onClick={() => setIsOpen('likes')}
                            className="text-zinc-300 cursor-pointer hover:underline"
                        >
                            <b>{likes.length}</b> Likes
                        </p>
                    </div>
                )}
                <PostActions
                    id={post?.id}
                    session={session}
                    comments={comments}
                    onClickComment={onClickComment}
                    deletePost={deletePost}
                    sharePost={sharePost}
                    likePost={likePost}
                    likes={likes}
                    liked={liked}
                    postPage={postPage}
                />

                {share && (
                    <div
                        onClick={e => e.stopPropagation()}
                        className="absolute right-0 bottom-10 z-10 bg-zinc-700 bg-opacity-95 rounded-lg max-w-xs space-y-3 p-3"
                    >
                        <SharePost url={`https://twidd.vercel.app/post/${id}`} />
                        <div className="flex items-center gap-1 text-gray-300 w-auto">
                            <p className="overflow-auto text-sm rounded-sm border border-gray-400 p-1">
                                {`https://twidd.vercel.app/post/${id}`}
                            </p>
                            <button
                                onClick={copyToClipboard}
                                className={`${copied ? "bg-zinc-900" : "bg-embed"} rounded-sm px-2 py-1`}
                            >
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isOpen === 'likes' && (
                <Modal>
                    <div className="p-4">
                        <p className="text-zinc-300 text-lg font-semibold mb-4">
                            Liked by
                        </p>
                        <div className="flex flex-col gap-y-2">
                            {likes.map(like => (
                                <Link
                                    key={like.uid}
                                    passHref={true}
                                    onClick={() => setIsOpen('')}
                                    href={"/profile/" + like?.id}
                                    className="hover:bg-zinc-700 flex rounded gap-x-2 px-2 py-1"
                                >
                                    <Image
                                        className="rounded-full w-auto"
                                        src={like?.userImg}
                                        height={36}
                                        width={36}
                                        alt=""
                                    />
                                    <div>
                                        <h4 className='font-semibold text-zinc-300'>
                                            {like?.username}
                                        </h4>
                                        <p className='text-gray-400 text-xs'>
                                            @{like?.tag}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
}

export default Post;