import { NextResponse } from "next/server"

export const GET = async (req,res)=> {
    return new NextResponse("Hello", {status: 200})
}