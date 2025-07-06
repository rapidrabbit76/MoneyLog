"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, redirect } from "next/navigation";
import { oauthLoginCallback } from "@/lib/api/auth";
import { useUserStore } from "@/store/user-store";



export default function OAuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
    // const [message, setMessage] = useState("인증을 처리하고 있습니다...");
    const hasProcessed = useRef(false);

    useEffect(() => {
        // 이미 처리된 경우 중복 실행 방지
        if (hasProcessed.current) {
            return;
        }

        hasProcessed.current = true;

        const provider = searchParams.get("provider") ?? "";
        const code = searchParams.get("code") ?? "";
        const state = searchParams.get("state") ?? "";

        oauthLoginCallback({
            provider, code, state
        }).then((success) => {
            if (success) {
                useUserStore.getState().fetchUser().then(() => { })
                redirect("/");
            }
        }).catch((error) => {
            redirect("/login");
        });
    }, []);
    return <></>;
}




