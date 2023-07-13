import { getCustomerRecord } from "$lib/server/customers";
import { ENV } from "$lib/server/env";
import { stripe } from "$lib/server/stripe";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = async (event) => {
    const session = await event.locals.getSession();
    if (!session) {
        throw redirect(302, '/login');
    }

    const customer = await getCustomerRecord(session.user.id);

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${ENV.PUBLIC_BASE_URL}/account`
    });

    if (!portalSession) {
        throw error(500, "Error retrieving billing information. We're working on it!")
    }

    throw redirect(302, portalSession.url)
};