# End-to-end Method

Use the project's documented launch path or an existing project-specific run capability. Establish the expected result from the original request and project contract, then actually use the affected feature through its real entry point. Observe the key normal path and relevant failure paths, comparing visible state, output, or side effects with that expectation.

Choose tools appropriate to the surface: operate a browser or desktop UI, invoke a CLI, call a running service, or exercise a library's public interface with an existing harness. For a Skill, invoke it on a realistic task and inspect what the agent actually does and produces. Use available project tools and host capabilities; an interface category alone does not establish that it cannot be exercised.

Exercise the entry point the claim concerns. Calling a UI's underlying function or API does not show that its controls work, and reading a Skill does not show how an agent follows it. Existing end-to-end automation is suitable when it performs the same real operation and observes the claimed result. Reuse direct observations already completed for this verification unless changed evidence requires another run.

Record the operation, expected result, and observed result. Logs and screenshots help when they substantiate that comparison; successful startup alone does not establish functional success.

Actual use stays within the task's execution authority. Do not edit source or configuration to make the app launch or invent an alternate path when a required one is unavailable. Identify the concrete missing dependency, startup failure, access condition, or tool limitation and the behavior left unobserved. Complete unaffected observations; report established defects as findings and necessary evidence gaps without a demonstrated defect as inconclusive.
