module QA
  module Page
    module Project
      module Settings
        class ProtectedBranches < Page::Base
          view 'app/views/projects/protected_branches/shared/_dropdown.html.haml' do
            element :protected_branch_select
            element :protected_branch_dropdown
          end

          view 'app/views/projects/protected_branches/_create_protected_branch.html.haml' do
            element :allowed_to_push_select
            element :allowed_to_push_dropdown
          end

          view 'app/views/projects/protected_branches/shared/_branches_list.html.haml' do
            element :protected_branches_list
          end

          view 'app/views/projects/protected_branches/shared/_protected_branch.html.haml' do
            element :protected_branch_name
          end

          def select_branch(branch_name)
            click_element :protected_branch_select

            within_element(:protected_branch_dropdown) do
              click_on branch_name
            end
          end

          def allow_no_one_to_push
            allow_to_push('No one')
          end

          def allow_devs_and_masters_to_push
            allow_to_push('Developers + Masters')
          end

          def protect_branch
            click_on 'Protect'
          end

          def last_branch_name
            within_element(:protected_branches_list) do
              all('.qa-protected-branch-name').last
            end
          end

          def last_push_allowance
            within_element(:protected_branches_list) do
              all('.qa-allowed-to-push').last
            end
          end

          private

          def allow_to_push(text)
            click_element :allowed_to_push_select

            within_element(:allowed_to_push_dropdown) do
              click_on text
            end
          end
        end
      end
    end
  end
end