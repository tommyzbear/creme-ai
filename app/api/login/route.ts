import { supabase } from "@/lib/supabase";
import { DiscordOAuthWithMetadata, EmailWithMetadata, GoogleOAuthWithMetadata, TwitterOAuthWithMetadata, User, WalletWithMetadata } from "@privy-io/react-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const user = (await request.json()) as User;

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('account')
            .select()
            .eq('id', user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
            console.error('Error fetching user:', fetchError);
            return NextResponse.json({ error: 'Error checking user existence' }, { status: 500 });
        }

        let dbUser = existingUser;
        if (!existingUser) {
            // Insert new user
            const { data: insertedUser, error: insertError } = await supabase
                .from('account')
                .insert({
                    id: user.id,
                    created_at: user.createdAt,
                    has_accepted_terms: user.hasAcceptedTerms,
                    is_guest: user.isGuest,
                    username: getDefaultUsername(user),
                })
                .select()
                .single();

            if (insertError || !insertedUser) {
                console.error('Error inserting user:', insertError);
                return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
            }

            dbUser = insertedUser;
        }

        if (user.email && user.linkedAccounts.filter(account => account.type === 'email').length > 0) {
            const email = user.linkedAccounts.find(account => account.type === 'email') as EmailWithMetadata;
            const { error: insertEmailError } = await supabase
                .from('email')
                .upsert({
                    account_id: dbUser.id,
                    address: email.address,
                    type: 'email',
                    verified_at: email.verifiedAt,
                    first_verified_at: email.firstVerifiedAt,
                    latest_verified_at: email.latestVerifiedAt,
                }, { onConflict: 'address' });

            if (insertEmailError) {
                console.error('Error inserting email:', insertEmailError);
                return NextResponse.json({ error: 'Error creating email, please make sure this email is not already registered' }, { status: 500 });
            }
        }

        if (user.wallet && user.linkedAccounts.filter(account => account.type === 'wallet').length > 0) {
            const wallet = user.linkedAccounts.find(account => account.type === 'wallet') as WalletWithMetadata;
            const { error: insertWalletError } = await supabase
                .from('wallet')
                .upsert({
                    account_id: dbUser.id,
                    address: wallet.address,
                    type: 'wallet',
                    verified_at: wallet.verifiedAt,
                    first_verified_at: wallet.firstVerifiedAt,
                    latest_verified_at: wallet.latestVerifiedAt,
                    chain_type: wallet.chainType,
                    wallet_client_type: wallet.walletClientType,
                    connector_type: wallet.connectorType,
                    recovery_method: wallet.recoveryMethod,
                    imported: wallet.imported,
                    delegated: wallet.delegated,
                    wallet_index: wallet.walletIndex,
                }, { onConflict: 'address' });

            if (insertWalletError) {
                console.error('Error inserting wallet:', insertWalletError);
                return NextResponse.json({ error: 'Error creating wallet, please make sure this wallet is not already registered' }, { status: 500 });
            }
        }

        if (user.google && user.linkedAccounts.filter(account => account.type === 'google_oauth').length > 0) {
            const google = user.linkedAccounts.find(account => account.type === 'google_oauth') as GoogleOAuthWithMetadata;
            const { error: insertGoogleError } = await supabase
                .from('google')
                .upsert({
                    account_id: dbUser.id,
                    subject: google.subject,
                    email: google.email,
                    name: google.name,
                    type: 'google_oauth',
                    verified_at: google.verifiedAt,
                    first_verified_at: google.firstVerifiedAt,
                    latest_verified_at: google.latestVerifiedAt,
                }, { onConflict: 'subject' });

            if (insertGoogleError) {
                console.error('Error inserting google:', insertGoogleError);
                return NextResponse.json({ error: 'Error creating google, please make sure this google account is not already registered' }, { status: 500 });
            }
        }

        if (user.twitter && user.linkedAccounts.filter(account => account.type === 'twitter_oauth').length > 0) {
            const twitter = user.linkedAccounts.find(account => account.type === 'twitter_oauth') as TwitterOAuthWithMetadata;
            const { error: insertTwitterError } = await supabase
                .from('twitter')
                .upsert({
                    account_id: dbUser.id,
                    subject: twitter.subject,
                    username: twitter.username,
                    name: twitter.name,
                    profile_picture_url: twitter.profilePictureUrl,
                    type: 'twitter_oauth',
                    verified_at: twitter.verifiedAt,
                    first_verified_at: twitter.firstVerifiedAt,
                    latest_verified_at: twitter.latestVerifiedAt,
                }, { onConflict: 'subject' });

            if (insertTwitterError) {
                console.error('Error inserting twitter:', insertTwitterError);
                return NextResponse.json({ error: 'Error creating twitter, please make sure this twitter account is not already registered' }, { status: 500 });
            }
        }

        if (user.discord && user.linkedAccounts.filter(account => account.type === 'discord_oauth').length > 0) {
            const discord = user.linkedAccounts.find(account => account.type === 'discord_oauth') as DiscordOAuthWithMetadata;
            const { error: insertDiscordError } = await supabase
                .from('discord')
                .upsert({
                    account_id: dbUser.id,
                    subject: discord.subject,
                    username: discord.username,
                    email: discord.email,
                    type: 'discord_oauth',
                    verified_at: discord.verifiedAt,
                    first_verified_at: discord.firstVerifiedAt,
                    latest_verified_at: discord.latestVerifiedAt,
                }, { onConflict: 'subject' });

            if (insertDiscordError) {
                console.error('Error inserting discord:', insertDiscordError);
                return NextResponse.json({ error: 'Error creating discord, please make sure this discord account is not already registered' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

const getDefaultUsername = (user: User) => {
    switch (user.linkedAccounts[0].type) {
        case 'email':
            return (user.linkedAccounts[0] as EmailWithMetadata).address;
        case 'google_oauth':
            return (user.linkedAccounts[0] as GoogleOAuthWithMetadata).name;
        case 'twitter_oauth':
            return (user.linkedAccounts[0] as TwitterOAuthWithMetadata).username;
        case 'discord_oauth':
            return (user.linkedAccounts[0] as DiscordOAuthWithMetadata).username;
        default:
            return "anon_" + user.id.slice(-4);
    }
}